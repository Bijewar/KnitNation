"use client";

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase'; // Firebase authentication
import { addProductToFirestore, addProductsInBulk, uploadImagesAndGetUrls } from '../../stores'; // Firestore functions

// Function to generate a unique ID
const generateUniqueID = () => {
  return Math.random().toString(36).substr(2, 9);
};

const ALLOWED_UID = 'aqyiudsT06S3dXRiKfwWPYV1T5E3'; // Replace with the UID you want to grant access

const AddProductPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [user, setUser] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for user authentication and ownership
  useEffect(() => {
    const checkOwnership = async (user) => {
      if (user) {
        try {
          // Check if the current user's UID matches the allowed UID
          if (user.uid === ALLOWED_UID) {
            setUser(user);
            setIsLoading(false);
          } else {
            router.push('/'); // Redirect if not authorized
          }
        } catch (error) {
          console.error('Error checking ownership:', error);
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      checkOwnership(user);
    });

    return () => unsubscribe();
  }, [router]);

  // Handle image upload and set to state
  const handleImageChange = async (e) => {
    try {
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataURL = await readFileAsDataURL(file);
        setImages(prevImages => [...prevImages, { id: generateUniqueID(), name: file.name, dataURL }]);
      }
    } catch (error) {
      console.error('Error reading image files:', error);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  // Add single product
  const handleAddProduct = async () => {
    try {
      if (!user) {
        console.error('Error adding product: Unauthorized');
        return;
      }
      if (!name || !price || !description || !category || !subcategory) {
        console.error('Please fill all required fields');
        return;
      }

      let imageUrlsToUse = [];
      if (images.length > 0) {
        imageUrlsToUse = await uploadImagesAndGetUrls(images);
      }

      let collectionName = '';
      const lowerCaseCategory = category.toLowerCase();
      if (lowerCaseCategory === 'men' || lowerCaseCategory === 'women') {
        collectionName = lowerCaseCategory + 's';
      } else {
        console.error('Invalid category');
        return;
      }

      const productData = {
        name,
        price,
        description,
        imageUrls: imageUrlsToUse,
        category,
        subcategory,
        ownerId: user.uid
      };

      await addProductToFirestore(productData, collectionName);
      console.log('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error.message);
    }
  };

  const handleRemoveImage = (id) => {
    setImages(prevImages => prevImages.filter(image => image.id !== id));
  };

  // Bulk upload products from Excel file
  const handleBulkUpload = async () => {
    try {
      if (!user || !bulkFile) {
        console.error('Error uploading products: Unauthorized or no file selected');
        return;
      }

      const data = await readFileAsBinaryString(bulkFile);
      const products = parseExcelData(data);

      const productPromises = products.map(async (product) => {
        const imageUrls = [];
        if (product.imageUrls && product.imageUrls.length > 0) {
          for (const imageUrl of product.imageUrls) {
            if (imageUrl.startsWith('http')) {
              imageUrls.push(imageUrl);
            } else {
              const response = await fetch(`/path/to/images/${imageUrl}`);
              if (!response.ok) {
                console.warn(`Error fetching image from "${imageUrl}"`);
                continue;
              }
              const blob = await response.blob();
              const dataURL = URL.createObjectURL(blob);
              imageUrls.push(dataURL);
            }
          }
        }
        return { ...product, imageUrls };
      });

      const uploadedProducts = await Promise.all(productPromises);
      await addProductsInBulk(uploadedProducts);
      console.log('Bulk upload completed successfully');
    } catch (error) {
      console.error('Error uploading products:', error.message);
      throw error;
    }
  };

  const readFileAsBinaryString = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsBinaryString(file);
    });
  };

  const parseExcelData = (data) => {
    try {
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const products = XLSX.utils.sheet_to_json(sheet);

      const parsedProducts = products.map(product => {
        const trimmedCategory = product.category && typeof product.category === 'string' ? product.category.trim() : 'Uncategorized';
        const ownerId = user.uid || generateUniqueID();

        if (trimmedCategory.toLowerCase() !== 'mens' && trimmedCategory.toLowerCase() !== 'womens') {
          console.warn(`Invalid category "${trimmedCategory}". Skipping product.`);
          return null;
        }

        const imageUrls = typeof product.imageUrls === 'string' ? product.imageUrls.split(',').map(url => url.trim()) : product.imageUrls;

        return {
          ...product,
          category: trimmedCategory,
          collectionName: trimmedCategory.toLowerCase(),
          ownerId: ownerId,
          imageUrls: imageUrls || [],
        };
      }).filter(product => product !== null);

      return parsedProducts;
    } catch (error) {
      console.error('Error parsing Excel data:', error.message);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Add Single Product</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="file" accept="image/*" onChange={handleImageChange} multiple />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select category</option>
        <option value="men">Men</option>
        <option value="women">Women</option>
      </select>
      {category === 'men' && (
        <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
          <option value="">Select subcategory</option>
          <option value="Jeans">Jeans</option>
          <option value="Shirts">Shirts</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Shorts">Shorts</option>
        </select>
      )}
      {category === 'women' && (
        <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
          <option value="">Select subcategory</option>
          <option value="Curve">Curve</option>
          <option value="Cargo">Cargo</option>
          <option value="Jeans">Jeans</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Shirts">Shirts</option>
          <option value="skirts">skirts</option>
        </select>
      )}
      <button onClick={handleAddProduct}>Add Product</button>

      <h2>Upload Bulk Products</h2>
      <input type="file" accept=".xlsx" onChange={(e) => setBulkFile(e.target.files[0])} />
      <button onClick={handleBulkUpload}>Upload Bulk Products</button>
    </div>
  );
};

export default AddProductPage;
