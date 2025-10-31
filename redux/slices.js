import { createSlice, configureStore } from '@reduxjs/toolkit';

// City and Delivery Slice
const cityAndDeliverySlice = createSlice({
  name: 'cityAndDelivery',
  initialState: {
    city: '',
    estimatedDeliveryDate: '',
    pincode: '',
  },
  reducers: {
    setCity(state, action) {
      state.city = action.payload;
    },
    setEstimatedDeliveryDate(state, action) {
      state.estimatedDeliveryDate = action.payload;
    },
    setPincode(state, action) {
      state.pincode = action.payload;
    },
  },
});

export const { setCity, setEstimatedDeliveryDate, setPincode } = cityAndDeliverySlice.actions;
export const cityAndDeliveryReducer = cityAndDeliverySlice.reducer;

// Authentication Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setUser, logout, setError } = authSlice.actions;
export const authReducer = authSlice.reducer;

// Products Slice
const productSlice = createSlice({
  name: 'products',
  initialState: {
    loading: false,
    error: null,
    men: {},
    women: {},
    parsedProduct: null,
    selectedImage: '',
    isSizeChartModalOpen: false,
  },
  reducers: {
    fetchProductsStart(state) {
      state.loading = true;
      state.error = null;
      console.log('Fetching products...');
    },
    fetchProductsSuccess(state, action) {
      const { category, data } = action.payload;
      if (!Array.isArray(data)) {
        console.error('Data is not an array in fetchProductsSuccess');
        return;
      }
      const serializedData = data.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt).toISOString(),
      }));
      
      state[category] = {};
      serializedData.forEach(product => {
        if (!state[category][product.subcategory]) {
          state[category][product.subcategory] = [];
        }
        state[category][product.subcategory].push(product);
      });
      
      state.loading = false;
      console.log('Products loaded successfully:', state[category]);
    },
    fetchProductsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      console.error('Failed to load products:', action.payload);
    },
    setSelectedImage(state, action) {
      state.selectedImage = action.payload;
    },
    clearSelectedImage(state) {
      state.selectedImage = '';
    },
    toggleSizeChartModal(state) {
      state.isSizeChartModalOpen = !state.isSizeChartModalOpen;
    },
    setParsedProduct(state, action) {
      state.parsedProduct = action.payload;
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setSelectedImage,
  clearSelectedImage,
  toggleSizeChartModal,
  setParsedProduct,
} = productSlice.actions;

export const productsReducer = productSlice.reducer;

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isAuthenticated: false,
  },
  reducers: {
    setAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
    },
    addToCart(state, action) {
      // Handle both single item and array of items
      if (Array.isArray(action.payload)) { 
        // If payload is an array (for fetching from database/local storage)
        state.items = action.payload; 
      } else {
        // If payload is a single item (for adding new items)
        const existingItem = state.items.find(item => item.id === action.payload.id);
        if (existingItem) {
          existingItem.quantity += 1; // Or action.payload.quantity if you want to allow adding multiple at once
        } else {
          state.items.push({ ...action.payload, quantity: 1 });
        }
      }
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    removeFromCart(state, action) {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});


export const { addToCart, updateQuantity, setAuthenticated, removeFromCart, clearCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isCartOpen: false,
  },
  reducers: {
    setCartOpen(state, action) {
      state.isCartOpen = action.payload;
    },
    resetCartState(state) {
      state.isCartOpen = false;
    },
  },
});

export const { setCartOpen, resetCartState } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

// Configure Store
const rootReducer = {
  cityAndDelivery: cityAndDeliveryReducer,
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  ui: uiReducer,
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
