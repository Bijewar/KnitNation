import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, getDocs, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db, storage } from './firebase'; // Ensure correct import path for Firebase configuration

// Function to generate a unique ID
const generateUniqueID = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Function to upload images and get their download URLs
const uploadImagesAndGetUrls = async (images) => {
  const imageUrls = [];

  for (const image of images) {
    const { name, dataURL } = image;
    try {
      const storageRef = ref(storage, `productImages/${name}-${Date.now()}`);
      console.log(`Uploading image: ${name}`);
      await uploadString(storageRef, dataURL, 'data_url');
      console.log(`Image uploaded successfully: ${name}`);
      const imageUrl = await getDownloadURL(storageRef);
      imageUrls.push(imageUrl);
      console.log(`Image URL for "${name}": ${imageUrl}`);
    } catch (error) {
      console.error(`Error uploading image "${name}":`, error.message);
      // Handle the error as needed
    }
  }

  return imageUrls;
};

// Function to add a product to Firestore
const addProductToFirestore = async (productData, collectionName) => {
  try {
    const { name, price, description, imageUrls, ownerId, category, subcategory } = productData;

    console.log(`Adding product to Firestore collection: ${collectionName}`);
    const docRef = await addDoc(collection(db, collectionName), {
      name,
      price,
      description,
      imageUrls,
      category,
      subcategory,
      ownerId,
      createdAt: Timestamp.now(),
      id: '' // We'll update this after getting the auto-generated ID
    });

    // Update the document with its auto-generated ID
    await updateDoc(docRef, { id: docRef.id });

    console.log(`Product "${name}" added to Firestore successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding product "${productData.name}" to Firestore:`, error.message);
    throw error;
  }
};

// Function to update products in Firestore with their IDs
const updateProductsWithId = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);

    querySnapshot.forEach(docSnapshot => {
      const productRef = doc(db, collectionName, docSnapshot.id);
      batch.update(productRef, { id: docSnapshot.id });
    });

    await batch.commit();
    console.log(`Successfully updated products in ${collectionName} with their IDs.`);
  } catch (error) {
    console.error(`Error updating products in ${collectionName} with IDs:`, error.message);
    throw error;
  }
};

// Function to update all products in 'mens' and 'womens' collections with IDs
const updateAllProductsWithIds = async () => {
  try {
    await updateProductsWithId('mens');
    await updateProductsWithId('womens');
    console.log('All products updated with their IDs.');
  } catch (error) {
    console.error('Error updating all products with IDs:', error.message);
    throw error;
  }
};

// Function to read Excel file and parse its data
const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      resolve(jsonData);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

// Function to handle bulk upload from Excel file
const handleBulkUploadFromExcel = async (file) => {
  try {
    const jsonData = await readExcelFile(file);
    console.log('Data from Excel file:', jsonData);
    await addProductsInBulk(jsonData); // Perform bulk upload with the parsed data
    console.log('Bulk upload completed successfully');
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
};

// Function to add products in bulk to Firestore
const addProductsInBulk = async (productsData) => {
  try {
    let successCount = 0;

    for (const productData of productsData) {
      console.log(`Processing product: ${productData.name}`);

      // Ensure both category and ownerId are present
      if (!productData.category) {
        console.error(`Error adding product "${productData.name}": Category not specified`);
        continue; // Skip products without a category
      }

      if (!productData.ownerId) {
        console.warn(`Product "${productData.name}" missing ownerId. Generating a random ID.`);
        productData.ownerId = generateUniqueID(); // Replace with your ID generation logic
      }

      // Ensure valid collection name
      const collectionName = getCategoryCollectionName(productData.category);
      if (!collectionName) {
        console.error(`Error: Invalid category "${productData.category}" for product "${productData.name}"`);
        continue; // Skip products with invalid category
      }

      // Product data for Firestore
      const productToFirestore = {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        imageUrls: productData.imageUrls || [], // Empty array if no imageUrls
        category: productData.category, // Maintain original category name
        subcategory: productData.subcategory,
        ownerId: productData.ownerId,
        createdAt: Timestamp.now() // Use Firestore Timestamp for createdAt
      };

      try {
        console.log(`Adding product "${productData.name}" to collection: ${collectionName}`);

        const addedProductRef = await addDoc(collection(db, collectionName), productToFirestore);
        successCount++;

        // Image upload after successful product addition
        if (productData.imageUrls && productData.imageUrls.length > 0) {
          // Update product document with image URLs
          await updateDoc(addedProductRef, {
            imageUrls: productData.imageUrls
          });
        }
      } catch (error) {
        console.error(`Error adding product "${productData.name}" to Firestore:`, error.message);
      }
    }

    console.log(`Successfully added ${successCount} products to Firestore.`);
    return successCount;
  } catch (error) {
    console.error('Error uploading products:', error.message);
    throw error;
  }
};

// Function to fetch products from both 'mens' and 'womens' collections
const fetchProducts = async () => {
  try {
    const menProducts = await fetchMenProducts();
    const womenProducts = await fetchWomenProducts();
    return { 
      men: menProducts.map(product => ({ ...product, id: product.id })), 
      women: womenProducts.map(product => ({ ...product, id: product.id }))
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to fetch products from 'mens' collection
const fetchMenProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "mens"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching men products:', error);
    throw error;
  }
};
const addUserToFirestore = async (userId, email, fullName, phoneNumber) => {
  try {
    // Your logic to add user to Firestore
    console.log(`Adding user to Firestore: ${userId}`);
    const userDocRef = await addDoc(collection(db, 'users'), {
      userId,
      phoneNumber, // Ensure this field is correctly added

      email,
      fullName,
      createdAt: Timestamp.now()
    });
    console.log(`User "${fullName}" added to Firestore successfully with ID: ${userDocRef.id}`);
    return userDocRef.id;
  } catch (error) {
    console.error('Error adding user to Firestore:', error.message);
    throw error;
  }
};

// Function to fetch products from 'womens' collection
const fetchWomenProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "womens"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching women products:', error);
    throw error;
  }
};

// Function to get Firestore collection name based on category
const getCategoryCollectionName = (category) => {
  const collectionNames = {
    men: 'mens',
    women: 'womens',
    // Add more mappings as needed
  };

  return collectionNames[category.toLowerCase()] || null;
};
export const checkUserExists = async (email, phoneNumber) => {
  const db = getFirestore();
  const usersRef = collection(db, 'users');
  
  const emailQuery = query(usersRef, where('email', '==', email));
  const phoneQuery = query(usersRef, where('phoneNumber', '==', phoneNumber));
  
  const [emailSnapshot, phoneSnapshot] = await Promise.all([
    getDocs(emailQuery),
    getDocs(phoneQuery)
  ]);
  
  return !emailSnapshot.empty || !phoneSnapshot.empty;
};
const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() // This should include phoneNumber if it's in the document
    }));
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error;
  }
};

// Export functions for use in other modules
export {
  addProductToFirestore,
  updateProductsWithId,
  fetchUsers,
  addUserToFirestore,
  updateAllProductsWithIds,
  addProductsInBulk,
  handleBulkUploadFromExcel,
  uploadImagesAndGetUrls,
  fetchProducts
};
