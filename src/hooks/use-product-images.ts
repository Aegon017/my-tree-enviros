"use client";

import { useEffect, useState, useMemo } from "react";
import type { Product, ProductVariant } from "@/types/product.types";

interface ImageItem {
  id: number;
  url: string;
}

export function useProductImages(product?: Product, selectedVariant?: ProductVariant) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo<ImageItem[]>(() => {
    const variantImages = selectedVariant?.image_urls;
    const defaultImages = product?.default_variant?.image_urls;
    const productImages = product?.image_urls?.map((url: string, i: number) => ({ id: i, url }));

    return variantImages || defaultImages || productImages || [];
  }, [selectedVariant, product]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  return {
    images,
    currentIndex,
    setCurrentIndex,
    currentImage: images[currentIndex]?.url ?? product?.thumbnail_url ?? "/placeholder.jpg",
  };
}
