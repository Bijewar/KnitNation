import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust path as needed
import ProductDetails from '../../comp/ProductDetails'; // We'll create this next

export default function ProductPage({ params }) {
  return <ProductDetails id={params.id} />;
}

export async function generateStaticParams() {
  const mensRef = collection(db, 'mens');
  const womensRef = collection(db, 'womens');
  
  const [mensSnapshot, womensSnapshot] = await Promise.all([
    getDocs(mensRef),
    getDocs(womensRef)
  ]);
  
  const mensParams = mensSnapshot.docs.map(doc => ({ id: doc.id }));
  const womensParams = womensSnapshot.docs.map(doc => ({ id: doc.id }));
  
  return [...mensParams, ...womensParams];
}