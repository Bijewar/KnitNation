import { supabase, isSupabaseConfigured } from '../../../supabase';
import ProductDetails from '../../comp/ProductDetails';

export default function ProductPage({ params }) {
  return <ProductDetails id={params.id} />;
}

export async function generateStaticParams() {
  try {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('products').select('id');
    return (data || []).map((p) => ({ id: String(p.id) }));
  } catch (error) {
    console.error('Error generating static params from Supabase:', error);
    return [];
  }
}