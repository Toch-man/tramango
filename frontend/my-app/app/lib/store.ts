import { configureStore } from "@reduxjs/toolkit";
import { packages_api } from "./package_api";

export const store = configureStore({
  reducer: {
    [packages_api.reducerPath]: packages_api.reducer,
  },
  middleware: (get_default_middleware) =>
    get_default_middleware().concat(packages_api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
