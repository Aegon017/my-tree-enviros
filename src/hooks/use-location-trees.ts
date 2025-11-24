"use client";

import { useEffect, useState } from "react";
import { treeService } from "@/services/tree.services";
import type { TreeListItem } from "@/types/tree.types";

export function useLocationTrees(lat?: number, lng?: number) {
  const [sponsorTrees, setSponsorTrees] = useState<TreeListItem[]>([]);
  const [adoptTrees, setAdoptTrees] = useState<TreeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) {
      setSponsorTrees([]);
      setAdoptTrees([]);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [sponsorRes, adoptRes] = await Promise.all([
          treeService.list({
            user_lat: lat,
            user_lng: lng,
            type: "sponsor",
            radius_km: 50,
            per_page: 5,
          }),
          treeService.list({
            user_lat: lat,
            user_lng: lng,
            type: "adopt",
            radius_km: 50,
            per_page: 5,
          }),
        ]);

        if (!active) return;

        setSponsorTrees(sponsorRes.data?.trees ?? []);
        setAdoptTrees(adoptRes.data?.trees ?? []);
      } catch (e: any) {
        if (!active) return;
        setError(e.message || "Failed to load trees");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [lat, lng]);

  return { sponsorTrees, adoptTrees, loading, error } as const;
}
