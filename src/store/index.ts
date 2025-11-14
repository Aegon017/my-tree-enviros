"use client";

import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import authReducer from "./auth-slice";
import cartReducer from "./cart-slice";
import locationReducer from "./location-slice";

const persistedLocationReducer = persistReducer(
  { key: "location", storage },
  locationReducer
);

export const store = configureStore( {
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    location: persistedLocationReducer,
  },
  middleware: ( getDefaultMiddleware ) =>
    getDefaultMiddleware( {
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    } ),
} );

export const persistor = persistStore( store );

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;