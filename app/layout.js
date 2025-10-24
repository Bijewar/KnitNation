"use client";
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store'; // Adjust the import path if needed
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchCart } from '../redux/slices';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function RootLayout({ children }) {
  // ... (rest of your RootLayout component)

  return (
    <html>
      <body>
        <ToastContainer /> 

        <Provider store={store}> {/* Wrap CartProvider with Provider */}
            {children}
        </Provider>
      </body>
    </html>
  );
}
