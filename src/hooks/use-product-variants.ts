"use client";

import { useMemo, useEffect } from "react";
import { variantService } from "@/services/variant.services";
import type { Product } from "@/types/product.types";
import type {
  ProductVariant,
  VariantColor,
  VariantPlanter,
  VariantSize,
} from "@/types/variant.types";

interface Props {
  product?: Product;
  selectedColor?: VariantColor;
  selectedSize?: VariantSize;
  selectedPlanter?: VariantPlanter;
  onVariantChange: (v: ProductVariant | undefined) => void;
}

export function useProductVariants({
  product,
  selectedColor,
  selectedSize,
  selectedPlanter,
  onVariantChange,
}: Props) {
  const availableSizes = useMemo(
    () => variantService.getAvailableSizes(product),
    [product],
  );
  const availablePlanters = useMemo(
    () => variantService.getAvailablePlanters(product, selectedSize),
    [product, selectedSize],
  );
  const availableColors = useMemo(
    () =>
      variantService.getAvailableColors(product, selectedSize, selectedPlanter),
    [product, selectedSize, selectedPlanter],
  );

  useEffect(() => {
    const variant = variantService.resolveVariant(
      product,
      selectedColor,
      selectedSize,
      selectedPlanter,
    );
    onVariantChange(variant);
  }, [product, selectedColor, selectedSize, selectedPlanter, onVariantChange]);

  return { availableColors, availableSizes, availablePlanters };
}
