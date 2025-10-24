"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure } from '../../../redux/slices';
import { fetchProducts } from '../../../stores';
import '../../../style/home.css';

const CollectionPage = () => {
  const params = useParams();
  const category = params.category;
  const dispatch = useDispatch();
  const router = useRouter();
  const womensProducts = useSelector(state => state.products.women);
  const [loading, setLoading] = useState(true);
  const productRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching products...');
        dispatch(fetchProductsStart());
        const productsData = await fetchProducts();
        console.log('Fetched products:', productsData);
        const filteredProductsData = {
          category: 'women',
          data: productsData.women.map((product) => ({
            ...product,
            createdAt: product.createdAt.toDate().toISOString(),
          })),
        };
        dispatch(fetchProductsSuccess(filteredProductsData));
        setLoading(false);
      } catch (error) {
        dispatch(fetchProductsFailure(error.message));
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const getFilteredProducts = () => {
    console.log('Women\'s Products from Redux:', womensProducts);
    if (!womensProducts) return [];
    
    const subcategoryLower = category.toLowerCase();
    const subcategoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
    
    const filteredProducts = womensProducts[subcategoryLower] || womensProducts[subcategoryCapitalized] || [];
    
    console.log('Filtered Products for', category, filteredProducts);
    return filteredProducts;
  };

  const filteredProducts = getFilteredProducts();

  useEffect(() => {
    productRefs.current = productRefs.current.slice(0, filteredProducts.length);
  }, [filteredProducts]);

  const handleProductHover = (index) => {
    if (productRefs.current[index]) {
      const productElement = productRefs.current[index];
      const image = productElement.querySelector('.product-image');
      const highlight = productElement.querySelector('.productHighlight');
      const buyButton = productElement.querySelector('.buyNowButton');

      if (image && image.nextElementSibling) {
        image.style.opacity = '0';
        image.nextElementSibling.style.opacity = '1';
      }
      if (highlight) highlight.style.opacity = '1';
      if (buyButton) buyButton.style.opacity = '1';
    }
  };

  const handleProductLeave = (index) => {
    if (productRefs.current[index]) {
      const productElement = productRefs.current[index];
      const image = productElement.querySelector('.product-image');
      const highlight = productElement.querySelector('.productHighlight');
      const buyButton = productElement.querySelector('.buyNowButton');

      if (image && image.nextElementSibling) {
        image.style.opacity = '1';
        image.nextElementSibling.style.opacity = '0';
      }
      if (highlight) highlight.style.opacity = '0';
      if (buyButton) buyButton.style.opacity = '0';
    }
  };

  const handleBuyNow = (product) => {
    console.log('Buy Now clicked for product:', product);
    if (product && product.id) {
      router.push(`/product/${product.id}`);
    } else {
      console.error('Invalid product data:', product);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="collection-page">
      <div className="nav">
        <div className="rightpart">
          <ul className="right">
            <li>
              <Link href="/" className="mensec">
                Womens
              </Link>
            </li>
            <li>
              <Link href="/men" className="womensec">
                Mens
              </Link>
            </li>
          </ul>
          <img className="logo" src="/logo.png" alt="logo" />
        </div>
        <div className="leftpart">
          <input
            type="text"
            placeholder="What are you looking for?"
            className="search"
          />
          <img className="icon" src="/search-line.png" alt="" />
          <img className="acc" src="/acc.png" alt="" />
          <img className="cart" src="/cart.png" alt="" />
        </div>
      </div>

      <div className="main">
        <h1 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)} Collection</h1>
        <div className="products">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="product"
                ref={el => productRefs.current[index] = el}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => handleProductHover(index)}
                onMouseLeave={() => handleProductLeave(index)}
              >
                <div className="product-image-container">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <>
                      <img
                        className="product-image rounded-xl"
                        src={product.imageUrls[0]}
                        alt={product.name}
                        style={{ opacity: 1, transition: 'opacity 0.3s ease-in-out' }}
                      />
                      <img
                        className="product-image rounded-xl"
                        src={product.imageUrls[1] || product.imageUrls[0]}
                        alt={product.name}
                        style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out', position: 'absolute', top: 0, left: 0 }}
                      />
                    </>
                  ) : (
                    <div className="no-image">No image available</div>
                  )}
                  <div 
                    className="productHighlight" 
                    style={{ 
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                  ></div>
                </div>
                <button
                  className="buyNowButton"
                  onClick={() => handleBuyNow(product)}
                  style={{ 
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                >
                  Buy Now
                </button>
                <div className="product-details">
                  <p className="prodname">{product.name || 'Unnamed Product'}</p>
                  <p className="prprice">₹ {product.price || 'Price not available'}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;