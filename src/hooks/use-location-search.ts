import { useCallback, useState } from "react";
import { useLocationStore } from "@/store/location-store";
import debounce from "lodash.debounce";

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&accept-language=en&q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const debouncedSearch = useCallback(debounce(fetchResults, 400), []);

  function search(q: string) {
    setQuery(q);
    debouncedSearch(q);
  }

  return { query, results, loading, search };
}

// Compatibility wrapper used by components that expect a `useLocation` hook.
export function useLocation() {
  const selectedLocation = useLocationStore((s) => s.selected);
  const syncFromStorage = useLocationStore((s) => s.sync);

  return { selectedLocation, syncFromStorage };
}
