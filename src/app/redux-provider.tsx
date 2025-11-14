"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export function ReduxProvider( {
  children,
  store,
  persistor,
}: {
  children: React.ReactNode;
  store: any;
  persistor: any;
} ) {
  return (
    <Provider store={ store }>
      <PersistGate loading={ null } persistor={ persistor }>
        { children }
      </PersistGate>
    </Provider>
  );
}