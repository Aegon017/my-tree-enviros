import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            setError("Failed to fetch user data");
          }
        } catch (err) {
          setError("An error occurred while fetching user data.");
        }
      }

      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const logout = async () => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          const data = await response.json();
          setError(data.message || "Logout failed.");
        }
      } catch (err) {
        setError("An error occurred during logout.");
      }
    }
  };

  return {
    user,
    logout,
    isLoading,
    error,
  };
};
