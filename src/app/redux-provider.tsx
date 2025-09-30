"use client";

import type { EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store as defaultStore } from "@/store";

export function ReduxProvider({
  children,
  store = defaultStore,
}: {
  children: ReactNode;
  store?: EnhancedStore;
}) {
  return <Provider store={store}>{children}</Provider>;
}
