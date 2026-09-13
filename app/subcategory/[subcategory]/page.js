"use client"

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../stores';
import { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure } from '../../../redux/slices';
import Header from '../../comp/Header';
import ListingView from '../../comp/ListingView';
import Footer from '../../comp/Footer';
import BottomNav from '../../comp/BottomNav';
import withReduxProvider from '../../hoc';
import { onAuthStateChange } from '../../../supabase';

const SubcategoryPage = () => {
  const router = useRouter();
  const { subcategory } = useParams();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const womensProducts = useSelector((state) => state.products.women);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track auth state for the header (same display-only pattern as the home page)
  useEffect(() => {
    const subscription = onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchProductsStart());
        const productsData = await fetchProducts();
        const filteredProductsData = {
          category: 'women',
          data: (productsData.women || []).map((product) => ({
            ...product,
            createdAt: typeof product.createdAt?.toDate === 'function'
              ? product.createdAt.toDate().toISOString()
              : new Date(product.createdAt || Date.now()).toISOString(),
          })),
        };
        dispatch(fetchProductsSuccess(filteredProductsData));
      } catch (error) {
        dispatch(fetchProductsFailure(error.message));
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
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

  const displayTitle = subcategory
    ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1)
    : 'Products';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />

      <main className="flex-1 pb-16 md:pb-0">
        <ListingView
          products={filteredProducts}
          onBuyNow={handleBuyNow}
          title={displayTitle}
          loading={loading && !womensProducts}
        />
      </main>

      <Footer />
      <BottomNav onBagClick={handleCartClick} />
    </div>
  );
};

export default withReduxProvider(SubcategoryPage);
