"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '../../stores';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure } from '../../redux/slices';
import Header from '../comp/Header';
import ListingView from '../comp/ListingView';
import Footer from '../comp/Footer';
import BottomNav from '../comp/BottomNav';
import withReduxProvider from '../hoc';
import { onAuthStateChange } from '../../supabase';

// Define numberToWord function to generate image names for the slideshow
const numberToWord = (number) => {
  const imageNames = ['one', 'two', 'three', 'four', 'five'];
  if (number >= 1 && number <= imageNames.length) {
    return imageNames[number - 1];
  } else {
    return '';
  }
};

const Men = () => {
  const [user, setUser] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayedProducts, setDisplayedProducts] = useState(4);
  const router = useRouter();
  const dispatch = useDispatch();

  // Read the men products the same way the women pages do (lower OR
  // capitalized subcategory key). The original selector read only the
  // lowercase key while the reducer groups by the stored value ("Jeans"),
  // so the men listing always showed 0 items (see change report).
  const menState = useSelector(state => state.products.men);
  const mensProducts = menState ? (menState.jeans || menState.Jeans) : null;
  const isLoading = useSelector(state => state.products.loading);
  const error = useSelector(state => state.products.error);

  const slideshowDuration = 5000; // milliseconds

  // Track auth state for the header (same display-only pattern as the home page)
  useEffect(() => {
    const subscription = onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  // Fetch products on component mount using useEffect hook
  useEffect(() => {
    console.log('Fetching products...');
    const fetchData = async () => {
      try {
        dispatch(fetchProductsStart()); // Dispatch action to indicate fetching start
        const productsData = await fetchProducts();
        console.log('Fetched products:', productsData);

        // Filter out createdAt before dispatching (if needed)
        const filteredProductsData = {
          category: 'men',
          data: (productsData.men || []).map(product => ({
            ...product,
            createdAt: typeof product.createdAt?.toDate === 'function'
              ? product.createdAt.toDate().toISOString()
              : new Date(product.createdAt || Date.now()).toISOString(),
          }))
        };

        dispatch(fetchProductsSuccess(filteredProductsData)); // Dispatch action with fetched products
      } catch (error) {
        dispatch(fetchProductsFailure(error.message));
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, []);

  console.log('Rendering Men component...');

  // Filter men's jeans products if mensProducts is available
  const menJeans = mensProducts ? mensProducts.filter(product => product.subcategory === 'Jeans') : [];

  // Function to handle "Show More" button click
  const handleShowMore = () => {
    setDisplayedProducts(prevCount => prevCount + 4); // Increase the displayed products count by 4
  };

  // Navigate to the product detail page - same routing behavior as the
  // other listing pages (the original men page Buy Now buttons were not wired)
  const handleBuyNow = (product) => {
    if (product && product.id) {
      router.push(`/product/${product.id}`);
    } else {
      console.error('Invalid product data:', product);
    }
  };

  const handleAccClick = () => {
    if (user) {
      // Header manages its own account dropdown panel
    } else {
      router.push('/login');
    }
  };

  // The bag drawer lives on the home page - route there to open it
  const handleCartClick = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />

      <main className="flex-1 pb-16 md:pb-0">
        <ListingView
          products={menJeans}
          onBuyNow={handleBuyNow}
          title="Men's Jeans"
          loading={isLoading && !mensProducts}
        />
      </main>

      <Footer />
      <BottomNav onBagClick={handleCartClick} />
    </div>
  );
};

export default withReduxProvider(Men);
