"use client";

import { useMemo, useEffect } from "react";
import { variantService } from "@/services/variant.service";
import type { Product, Color, Size, Planter, ProductVariant } from "@/types/product.types";

interface UseProductVariantsProps {
  product?: Product;
  selectedColor?: Color;
  selectedSize?: Size;
  selectedPlanter?: Planter;
  onVariantChange: (variant: ProductVariant | undefined) => void;
}

export function useProductVariants({
  product,
  selectedColor,
  selectedSize,
  selectedPlanter,
  onVariantChange,
}: UseProductVariantsProps) {
  const availableColors = useMemo(
    () => variantService.getAvailableColors(product, selectedPlanter),
    [product, selectedPlanter]
  );

  const availableSizes = useMemo(
    () => variantService.getAvailableSizes(product),
    [product]
  );

  const availablePlanters = useMemo(
    () => variantService.getAvailablePlanters(product, selectedSize),
    [product, selectedSize]
  );

  useEffect(() => {
    if (!product?.variants || !selectedPlanter) return;
    const resolved = variantService.resolveVariant(product, selectedColor, selectedSize, selectedPlanter);
    onVariantChange(resolved);
  }, [product, selectedColor, selectedSize, selectedPlanter, onVariantChange]);

  return {
    availableColors,
    availableSizes,
    availablePlanters,
  };
}
