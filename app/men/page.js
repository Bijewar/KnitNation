"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// pages/page/men.js
import { fetchProducts } from '../../stores';

// Your code using fetchProducts

import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure } from '../../redux/slices';
import css from "../../style/home.css";
import withReduxProvider from '../hoc';

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

  // Update selector to access state.products.men.jeans efficiently
  const mensProducts = useSelector(state => state.products.men.jeans);
  const isLoading = useSelector(state => state.products.loading);
  const error = useSelector(state => state.products.error);

  const slideshowDuration = 5000; // milliseconds

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
          data: productsData.men.map(product => ({
            ...product,
            // Remove createdAt or convert to string if needed
            // createdAt: product.createdAt?.toString()
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

  return (
    <>
      <div className='nav'>
        <ul className='right'>
          <li>
            <Link href="/" className='ml-3 font-bold' style={{ color: 'black' }}>
              Womens
            </Link>
          </li>
          <li>
            <Link href="/page/men" className='font-gilroy font-bold' style={{ color: 'black' }}>
              Mens
            </Link>
          </li>
        </ul>
        <img className='logo' src="/logo.png" alt="logo" />
        <input
          type="text"
          placeholder="What are you looking for?"
          className="search"
        />
        <img className='icon' src="/search-line.png" alt="" />
        <img className='acc' src="/acc.png" alt="" />
        <img className='cart' src="/cart.png" alt="" />
      </div>

      <div className='main'>
        <div className="slideshow-container">
          <AnimatePresence>
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: '0' }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ duration: 0.5 }}
              className="slide" // Added class name
            >
              <img className='display' src={`/${numberToWord(activeSlide + 1)}.webp`} alt="" />
              <div className="timer-container">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={`timer timer${index + 1} ${index === activeSlide ? 'active' : ''}`}
                    style={{ animationDelay: `${index === activeSlide ? 0 : slideshowDuration}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className='category'> Jeans</p>
        <div className='jeans'>
          <div className='products'>
            {menJeans.slice(0, displayedProducts).map((product, index) => (
              <div
                key={index}
                className='product'
              >
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img className='rounded-xl' src={product.imageUrls[0]} alt={product.name} />
                ) : (
                  <img className='rounded-xl' src="/fallback-image.jpg" alt="Fallback Image" />
                )}
                <button className='buy'>Buy Now</button>
                <div>
                  <span><p>₹ {product.price}</p></span>
                </div>
              </div>
            ))}
            {displayedProducts < menJeans.length && (
              <button className='show' onClick={handleShowMore}>Show More</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default withReduxProvider(Men);
