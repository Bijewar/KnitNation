"use client";

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../stores';
import { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure } from '../../redux/slices';
import Layout from '../layout';
import withReduxProvider from '../hoc';
import { gsap } from 'gsap';

const SubcategoryPage = () => {
  const router = useRouter();
  const { subcategory } = useParams();
  const dispatch = useDispatch();
  const womensProducts = useSelector((state) => state.products.women);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(-1);

  const HOVER_FLASH_DURATION = 0.3;
  const HOVER_FADE_DURATION = 0.3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchProductsStart());
        const productsData = await fetchProducts();
        const filteredProductsData = {
          category: 'women',
          data: productsData.women.map((product) => ({
            ...product,
            createdAt: product.createdAt.toDate().toISOString(),
          })),
        };
        dispatch(fetchProductsSuccess(filteredProductsData));
      } catch (error) {
        dispatch(fetchProductsFailure(error.message));
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (womensProducts) {
      const subcategoryLower = subcategory.toLowerCase();
      const subcategoryCapitalized =
        subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
      const filtered =
        womensProducts[subcategoryLower] ||
        womensProducts[subcategoryCapitalized] ||
        [];
      setFilteredProducts(filtered);
    }
  }, [womensProducts, subcategory]);

  const handleBuyNow = (product) => {
    console.log('Product to buy:', product);
    if (product && product.id) {
      router.push(`/product/${product.id}`);
    } else {
      console.error('Invalid product data:', product);
    }
  };

  const handleProductHovers = (productIndex) => {
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
    });
  };

  return (
    <Layout>
      <div className="main">
        <h2>{subcategory}</h2>
        <div className="products">
          {filteredProducts.map((product, index) => (
            <div
              key={index}
              className="product"
              onMouseEnter={() => handleProductHovers(index)}
              onMouseLeave={() => handleProductLeaves(index)}
            >
              <div className="product-image-container">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <div>No image available</div>
                )}
                <div
                  className="productHighlight"
                  style={{ opacity: 0 }}
                ></div> {' '}
                {/* Added productHighlight div */}
              </div>
              <button
                className="buyNowButton"
                onClick={() => handleBuyNow(product)}
              >
                Buy Now
              </button>
              <div>
                <span>
                  <p className="prodname">
                    {product.name || 'Unnamed Product'}
                  </p>
                </span>
                <span>
                  <p className="prprice">
                    ₹ {product.price || 'Price not available'}
                  </p>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default withReduxProvider(SubcategoryPage);