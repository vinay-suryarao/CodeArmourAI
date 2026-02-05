import { configureStore } from '@reduxjs/toolkit';
import scannerReducer from './slices/scannerSlice';

export const store = configureStore({
  reducer: {
    scanner: scannerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
