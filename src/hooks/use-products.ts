"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { productService } from "@/services/product.services";
import { BaseMeta } from "@/types/common.types";

export function useProducts(initialParams: Record<string, any>) {
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<BaseMeta | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef<Record<string, any>>(initialParams);
  const initializedRef = useRef(false);

  const loadList = useCallback(async (overrideParams?: any, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = overrideParams || paramsRef.current;
      const res = await productService.list(params);
      const list = res.products ?? [];
      const m = res.meta ?? null;
      setProducts((prev) => (reset ? list : [...prev, ...list]));
      setMeta(m);
      if (overrideParams) paramsRef.current = overrideParams;
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = () => {
    if (!meta || loading) return;
    if (meta.current_page >= meta.last_page) return;
    const nextParams = { ...paramsRef.current, page: meta.current_page + 1 };
    loadList(nextParams);
  };

  const loadCategories = async () => {
    try {
      const c = await productService.getCategories();
      setCategories(c);
    } catch {}
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    (async () => {
      await loadCategories();
      await loadList(paramsRef.current, true);
    })();
  }, [loadCategories, loadList]);

  return { products, meta, categories, loading, error, loadList, loadMore };
}
