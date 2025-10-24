import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  cityAndDeliveryReducer,
  authReducer,
  productsReducer,
  cartReducer,
  uiReducer,
} from './slices';

const rootReducer = combineReducers({
  cityAndDelivery: cityAndDeliveryReducer,
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'products/fetchProductsSuccess'],
        ignoredPaths: ['products.women.jeans', 'products.men.jeans'],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
