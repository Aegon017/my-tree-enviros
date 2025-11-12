"use client";

import { useCallback, useMemo, useReducer } from "react";
import type { Color, Size, Planter, ProductVariant, Product } from "@/types/product.types";

interface ProductState {
  selectedColor?: Color;
  selectedSize?: Size;
  selectedPlanter?: Planter;
  selectedVariant?: ProductVariant;
  quantity: number;
  isUserInteracting: boolean;
}

type ProductAction =
  | { type: "SET_COLOR"; payload: Color | undefined }
  | { type: "SET_SIZE"; payload: Size | undefined }
  | { type: "SET_PLANTER"; payload: Planter | undefined }
  | { type: "SET_VARIANT"; payload: ProductVariant | undefined }
  | { type: "SET_QUANTITY"; payload: number }
  | { type: "RESET_VARIANT" }
  | { type: "INITIALIZE"; payload: Partial<ProductState> };

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case "SET_COLOR":
      return { ...state, selectedColor: action.payload, isUserInteracting: true };
    case "SET_SIZE":
      return { ...state, selectedSize: action.payload, isUserInteracting: true };
    case "SET_PLANTER":
      return { ...state, selectedPlanter: action.payload, selectedColor: undefined, isUserInteracting: true };
    case "SET_VARIANT":
      return { ...state, selectedVariant: action.payload };
    case "SET_QUANTITY":
      return { ...state, quantity: action.payload };
    case "RESET_VARIANT":
      return { ...state, selectedVariant: undefined };
    case "INITIALIZE":
      return { ...state, ...action.payload, isUserInteracting: false };
    default:
      return state;
  }
}

export function useProductState(product?: Product) {
  const [state, dispatch] = useReducer(productReducer, {
    quantity: 1,
    isUserInteracting: false,
  });

  const setColor = useCallback((color: Color | undefined) => {
    dispatch({ type: "SET_COLOR", payload: color });
  }, []);

  const setSize = useCallback((size: Size | undefined) => {
    dispatch({ type: "SET_SIZE", payload: size });
  }, []);

  const setPlanter = useCallback((planter: Planter | undefined) => {
    dispatch({ type: "SET_PLANTER", payload: planter });
  }, []);

  const setVariant = useCallback((variant: ProductVariant | undefined) => {
    dispatch({ type: "SET_VARIANT", payload: variant });
  }, []);

  const setQuantity = useCallback((quantity: number) => {
    dispatch({ type: "SET_QUANTITY", payload: quantity });
  }, []);

  const initialize = useCallback((initialState: Partial<ProductState>) => {
    dispatch({ type: "INITIALIZE", payload: initialState });
  }, []);

  const maxStock = useMemo(
    () => state.selectedVariant?.stock_quantity ?? product?.default_variant?.stock_quantity ?? product?.inventory?.stock_quantity ?? 0,
    [state.selectedVariant, product]
  );

  const displayPrice = useMemo(
    () => state.selectedVariant?.selling_price ?? product?.default_variant?.selling_price ?? product?.selling_price ?? 0,
    [state.selectedVariant, product]
  );

  const displayBasePrice = useMemo(
    () => state.selectedVariant?.original_price ?? product?.default_variant?.original_price ?? product?.original_price ?? null,
    [state.selectedVariant, product]
  );

  const isInStock = useMemo(
    () => (product?.has_variants ? state.selectedVariant?.is_instock : product?.default_variant?.is_instock ?? product?.inventory?.is_instock),
    [product, state.selectedVariant]
  );

  return {
    ...state,
    setColor,
    setSize,
    setPlanter,
    setVariant,
    setQuantity,
    initialize,
    maxStock,
    displayPrice,
    displayBasePrice,
    isInStock,
  };
}
