import css from '../../style/home.css';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withReduxProvider from '../hoc';
import { fetchProducts } from '../../stores';
import { gsap } from 'gsap';
import { useRouter } from 'next/router';
import {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
} from '../../redux/slices';

const CatSelect = () => {
  const [hoverIndex, setHoverIndex] = useState(-1);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('jeans');
  const dispatch = useDispatch();
  const [displayedProducts, setDisplayedProducts] = useState(4);

  const womensProducts = useSelector((state) => state.products.women);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchProductsStart());
        const productsData = await fetchProducts();
        console.log('Fetched Products Data:', productsData);

        const filteredProductsData = {
          category: 'women',
          data: productsData.women.map((product) => ({
            ...product,
            createdAt: product.createdAt.toDate().toISOString(),
          })),
        };
        console.log('Filtered Products Data:', filteredProductsData);
        dispatch(fetchProductsSuccess(filteredProductsData));
      } catch (error) {
        console.error('Error fetching products:', error);
        dispatch(fetchProductsFailure(error.message));
      }
    };
    fetchData();
  }, [dispatch]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    console.log('Updated Selected Category:', category);
    setDisplayedProducts(4);
  };

  const handleBuyNow = (product) => {
    try {
      router.push({
        pathname: '/product-details',
        query: { product: JSON.stringify(product) },
      });
    } catch (error) {
      console.error('Error navigating to product details page:', error);
    }
  };

  const HOVER_FLASH_DURATION = 0.3;
  const HOVER_FADE_DURATION = 0.3;
  const TRANSITION_TIMEOUT = 200;

  let isTransitioning = false;

  const handleProductHovers = (productIndex) => {
    if (isTransitioning) return;

    if (hoverIndex !== -1 && hoverIndex !== productIndex) {
      gsap.to(`.product:nth-child(${hoverIndex + 1}) .productHighlight`, {
        opacity: 0,
        duration: 0.1,
      });
    }

    setHoverIndex(productIndex);
    showProductHighlight(productIndex);
  };

  const handleProductLeaves = (productIndex) => {
    if (hoverIndex !== productIndex) return;

    setHoverIndex(-1);
    hideProductHighlight(productIndex);
  };

  const showProductHighlight = (productIndex) => {
    gsap.to(`.product:nth-child(${productIndex + 1}) .productHighlight`, {
      opacity: 1,
      duration: HOVER_FLASH_DURATION,
      ease: 'power2.inOut',
    });
  };

  const hideProductHighlight = (productIndex) => {
    gsap.to(`.product:nth-child(${productIndex + 1}) .productHighlight`, {
      opacity: 0,
      duration: HOVER_FADE_DURATION,
      ease: 'power2.inOut',
      onComplete: () => {
        setTimeout(() => {
          isTransitioning = false;
        }, TRANSITION_TIMEOUT);
      },
    });
  };

  const getFilteredProducts = () => {
    console.log('Women\'s Products from Redux:', womensProducts);
    if (!womensProducts) return [];
    
    const subcategoryLower = selectedCategory.toLowerCase();
    const subcategoryCapitalized = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    
    const filteredProducts = womensProducts[subcategoryLower] || womensProducts[subcategoryCapitalized] || [];
    
    console.log('Filtered Products for', selectedCategory, filteredProducts);
    return filteredProducts;
  };

  const filteredProducts = getFilteredProducts();

  const handleShowMore = () => {
    setDisplayedProducts((prevDisplayedProducts) => prevDisplayedProducts + 4);
  };

  return (
    <div className="pro1">
      <div className="categories">
        <p
          className={selectedCategory === 'tops' ? 'selected' : ''}
          onClick={() => handleCategoryClick('tops')}
        >
          Tops
        </p>
        <p
          className={selectedCategory === 'jeans' ? 'selected' : ''}
          onClick={() => handleCategoryClick('jeans')}
        >
          Jeans
        </p>
        <p
          className={selectedCategory === 'skirts' ? 'selected' : ''}
          onClick={() => handleCategoryClick('skirts')}
        >
          Skirts
        </p>
      </div>
      <p>Total Products: {filteredProducts.length}</p>
      <div className="products">
        {filteredProducts.slice(0, displayedProducts).map((product, index) => (
          <div
            key={index}
            className="product"
            onMouseEnter={() => handleProductHovers(index)}
            onMouseLeave={() => handleProductLeaves(index)}
          >
            <div className="product-image-container">
              <img
                className="product-image rounded-xl"
                src={product.imageUrls[0]}
                alt={product.name}
                style={{ opacity: hoverIndex === index ? 0 : 1 }}
              />
              <img
                className="product-image rounded-xl"
                src={product.imageUrls[1] || product.imageUrls[0]}
                alt={product.name}
                style={{ opacity: hoverIndex === index ? 1 : 0 }}
              />
              <div className="image-overlay" style={{ opacity: isTransitioning ? 0.2 : 0 }}></div>
              <div className="white-flash" style={{ opacity: isTransitioning ? 1 : 0 }}></div>
            </div>
            <button className="buy" onClick={() => handleBuyNow(product)}>
              Buy Now
            </button>
            <div>
              <span>
                <p className="prodname">{product.name}</p>
              </span>
              <span>
                <p className="prprice">₹ {product.price}</p>
              </span>
            </div>
          </div>
        ))}

        {displayedProducts < filteredProducts.length && (
          <button className="show" onClick={handleShowMore}>
            Show More
          </button>
        )}
      </div>
    </div>
  );
};

export default withReduxProvider(CatSelect);