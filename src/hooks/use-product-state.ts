"use client";

import { useCallback, useReducer, useEffect, useMemo } from "react";
import { variantService } from "@/services/variant.services";
import type { Product } from "@/types/product.types";
import type {
  ProductVariant,
  VariantColor,
  VariantPlanter,
  VariantSize,
} from "@/types/variant.types";

interface ProductState {
  selectedColor?: VariantColor | null;
  selectedSize?: VariantSize | null;
  selectedPlanter?: VariantPlanter | null;
  selectedVariant?: ProductVariant;
  quantity: number;
  isUserInteracting: boolean;
}

type Action =
  | { type: "SET_COLOR"; payload?: VariantColor | null }
  | { type: "SET_SIZE"; payload?: VariantSize | null }
  | { type: "SET_PLANTER"; payload?: VariantPlanter | null }
  | { type: "SET_VARIANT"; payload?: ProductVariant }
  | { type: "SET_QUANTITY"; payload: number }
  | { type: "INITIALIZE"; payload: Partial<ProductState> };

function reducer(state: ProductState, action: Action): ProductState {
  switch (action.type) {
    case "SET_COLOR":
      return {
        ...state,
        selectedColor: action.payload,
        isUserInteracting: true,
      };
    case "SET_SIZE":
      return {
        ...state,
        selectedSize: action.payload,
        selectedPlanter: undefined,
        selectedColor: undefined,
        isUserInteracting: true,
      };
    case "SET_PLANTER":
      return {
        ...state,
        selectedPlanter: action.payload,
        selectedColor: undefined,
        isUserInteracting: true,
      };
    case "SET_VARIANT":
      return { ...state, selectedVariant: action.payload };
    case "SET_QUANTITY":
      return { ...state, quantity: action.payload };
    case "INITIALIZE":
      return { ...state, ...action.payload, isUserInteracting: false };
    default:
      return state;
  }
}

export function useProductState(product?: Product) {
  const [state, dispatch] = useReducer(reducer, {
    quantity: 1,
    isUserInteracting: false,
  });

  const setColor = useCallback(
    (v?: VariantColor | null) => dispatch({ type: "SET_COLOR", payload: v }),
    [],
  );
  const setSize = useCallback(
    (v?: VariantSize | null) => dispatch({ type: "SET_SIZE", payload: v }),
    [],
  );
  const setPlanter = useCallback(
    (v?: VariantPlanter | null) =>
      dispatch({ type: "SET_PLANTER", payload: v }),
    [],
  );
  const setVariant = useCallback(
    (v?: ProductVariant) => dispatch({ type: "SET_VARIANT", payload: v }),
    [],
  );
  const setQuantity = useCallback(
    (v: number) => dispatch({ type: "SET_QUANTITY", payload: v }),
    [],
  );
  const initialize = useCallback(
    (v: Partial<ProductState>) => dispatch({ type: "INITIALIZE", payload: v }),
    [],
  );

  useEffect(() => {
    if (!product?.variants?.length) return;
    if (state.selectedVariant) return;

    const first = product.variants[0];
    const init = {
      selectedVariant: first,
      selectedColor: first.variant?.color ?? null,
      selectedSize: first.variant?.size ?? null,
      selectedPlanter: first.variant?.planter ?? null,
    };

    initialize(init);
  }, [product]);

  useEffect(() => {
    if (!product?.variants?.length) return;

    const availablePlanters = variantService.getAvailablePlanters(
      product,
      state.selectedSize ?? undefined,
    );
    const availableColors = variantService.getAvailableColors(
      product,
      state.selectedSize ?? undefined,
      state.selectedPlanter ?? undefined,
    );

    let newPlanter = state.selectedPlanter;
    let newColor = state.selectedColor;

    if (
      state.selectedSize &&
      (!state.selectedPlanter ||
        !availablePlanters.some((p) => p.name === state.selectedPlanter?.name))
    ) {
      newPlanter = availablePlanters[0] ?? null;
      newColor = null;
    }

    if (
      (state.selectedSize || state.selectedPlanter) &&
      (!state.selectedColor ||
        !availableColors.some((c) => c.name === state.selectedColor?.name))
    ) {
      newColor =
        variantService.getAvailableColors(
          product,
          state.selectedSize ?? undefined,
          newPlanter ?? undefined,
        )[0] ?? null;
    }

    const variant = variantService.resolveVariant(
      product,
      newColor ?? undefined,
      state.selectedSize ?? undefined,
      newPlanter ?? undefined,
    );

    dispatch({ type: "SET_VARIANT", payload: variant });

    if (newPlanter !== state.selectedPlanter)
      dispatch({ type: "SET_PLANTER", payload: newPlanter });
    if (newColor !== state.selectedColor)
      dispatch({ type: "SET_COLOR", payload: newColor });
  }, [product, state.selectedSize, state.selectedPlanter]);

  const maxStock = useMemo(
    () => state.selectedVariant?.stock_quantity ?? 0,
    [state.selectedVariant],
  );
  const displayPrice = useMemo(
    () => state.selectedVariant?.selling_price ?? 0,
    [state.selectedVariant],
  );
  const displayBasePrice = useMemo(
    () => state.selectedVariant?.original_price ?? null,
    [state.selectedVariant],
  );
  const isInStock = useMemo(
    () => !!state.selectedVariant?.is_instock,
    [state.selectedVariant],
  );
  const inWishlist = useMemo(
    () => !!state.selectedVariant?.in_wishlist,
    [state.selectedVariant],
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
    inWishlist,
  };
}
