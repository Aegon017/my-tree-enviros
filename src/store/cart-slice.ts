"use client";

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  addCartDetails,
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
} from "@/services/cart.service";
import type { CartItem } from "@/types/cart.type";

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const data = await getCart();
  return data as CartItem[];
});

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({
    productId,
    payload,
  }: {
    productId: number;
    payload: Parameters<typeof addToCart>[1];
  }) => {
    await addToCart(productId, payload);
    return await getCart();
  },
);

export const updateCartItemDetails = createAsyncThunk(
  "cart/updateCartItemDetails",
  async ({
    cartId,
    details,
  }: {
    cartId: number;
    details: Parameters<typeof addCartDetails>[1];
  }) => {
    await addCartDetails(cartId, details);
    return await getCart();
  },
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (cartId: number) => {
    await removeCartItem(cartId);
    return await getCart();
  },
);

export const clearCartItems = createAsyncThunk(
  "cart/clearCartItems",
  async () => {
    await clearCart();
    return [];
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cart";
      })

      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addItemToCart.fulfilled,
        (state, action: PayloadAction<CartItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add item";
      })

      .addCase(updateCartItemDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateCartItemDetails.fulfilled,
        (state, action: PayloadAction<CartItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(updateCartItemDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update details";
      })

      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        removeItemFromCart.fulfilled,
        (state, action: PayloadAction<CartItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to remove item";
      })

      .addCase(clearCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartItems.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to clear cart";
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
