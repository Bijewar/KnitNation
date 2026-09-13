"use client";
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store'; // Adjust the import path if needed
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css'; // Load Tailwind + Myntra design tokens globally
import TopLoader from './comp/TopLoader';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <ToastContainer /> 

        <Provider store={store}> {/* Wrap CartProvider with Provider */}
            {children}
        </Provider>
      </body>
    </html>
  );
}
