import { useState, useCallback } from "react";

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    return new Promise<any>((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`,
              {
                headers: {
                  "User-Agent": "MyTreeEnviros/1.0",
                },
              }
            );

            if (!res.ok) {
              throw new Error("Failed to fetch address details");
            }

            const data = await res.json();
            resolve({ lat, lng, data });
          } catch (e) {
            resolve({
              lat,
              lng,
              data: {
                display_name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                address: {}
              }
            });
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
            console.warn("Geolocation unavailable/timeout, falling back to manual selection.");
          } else if (err.code === err.PERMISSION_DENIED) {
            console.warn("Geolocation permission denied.");
          } else {
            console.error(`Geolocation error: code=${err.code} message=${err.message}`);
          }

          let errorMessage = "Unable to fetch your location";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case err.TIMEOUT:
              errorMessage = "The request to get user location timed out";
              break;
          }
          setError(errorMessage);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 25000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return { getCurrentLocation, loading, error };
}
