import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from './supabase';

// Helper: Convert data URL to Blob for Supabase Storage
const dataURLToBlob = (dataURL) => {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

// Generate unique identifier
const generateUniqueID = () => {
  return Math.random().toString(36).substring(2, 11);
};

// --------------------------------------------------------------------------
// IMAGE UPLOAD (Supabase Storage: 'product-images' bucket)
// --------------------------------------------------------------------------
const uploadImagesAndGetUrls = async (images) => {
  const imageUrls = [];

  for (const image of images) {
    const { name, dataURL } = image;
    try {
      if (!isSupabaseConfigured() || typeof window === 'undefined') {
        // Fallback: If Supabase not yet configured, store the dataURL directly
        imageUrls.push(dataURL);
        continue;
      }

      const fileExt = name.split('.').pop();
      const fileName = `${Date.now()}-${generateUniqueID()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const blob = dataURLToBlob(dataURL);

      console.log(`Uploading image ${fileName} to Supabase storage...`);
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (error) {
        console.warn(`Supabase storage upload warning for "${name}":`, error.message);
        // Fallback to dataURL if bucket doesn't exist yet
        imageUrls.push(dataURL);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const url = publicUrlData?.publicUrl || dataURL;
        imageUrls.push(url);
        console.log(`Image uploaded successfully: ${url}`);
      }
    } catch (error) {
      console.error(`Error uploading image "${name}":`, error.message);
      // Fallback so the user's product can still be created
      if (dataURL) imageUrls.push(dataURL);
    }
  }

  return imageUrls;
};

// --------------------------------------------------------------------------
// ADD SINGLE PRODUCT
// --------------------------------------------------------------------------
const addProductToSupabase = async (productData, collectionName) => {
  try {
    const { name, price, description, imageUrls, ownerId, category, subcategory } = productData;
    const cleanCategory = (category || collectionName || 'women').toLowerCase().replace(/s$/, '');

    console.log(`Adding product "${name}" to Supabase category: ${cleanCategory}`);

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          price: parseFloat(price) || 0,
          description: description || '',
          image_urls: imageUrls || [],
          category: cleanCategory,
          subcategory: subcategory || 'General',
          owner_id: ownerId || null,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase product insert error:', error.message);
      throw error;
    }

    const insertedId = data?.[0]?.id || generateUniqueID();
    console.log(`Product "${name}" added to Supabase with ID:`, insertedId);
    return insertedId;
  } catch (error) {
    console.error('Error in addProductToSupabase:', error.message);
    throw error;
  }
};

// Alias for backwards compatibility
const addProductToFirestore = addProductToSupabase;

// --------------------------------------------------------------------------
// BULK PRODUCT UPLOAD (Excel XLSX)
// --------------------------------------------------------------------------
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

const addProductsInBulk = async (productsData) => {
  try {
    if (!productsData || productsData.length === 0) return 0;

    const rows = productsData.map((p) => {
      const cat = (p.category || 'women').toLowerCase().replace(/s$/, '');
      return {
        name: p.name || 'Unnamed Product',
        price: parseFloat(p.price) || 0,
        description: p.description || '',
        image_urls: p.imageUrls || [],
        category: cat,
        subcategory: p.subcategory || 'General',
        owner_id: p.ownerId || null,
      };
    });

    console.log(`Bulk inserting ${rows.length} products to Supabase...`);
    const { data, error } = await supabase.from('products').insert(rows).select();

    if (error) {
      console.error('Supabase bulk insert error:', error.message);
      throw error;
    }

    console.log(`Successfully added ${data?.length || rows.length} products to Supabase.`);
    return data?.length || rows.length;
  } catch (error) {
    console.error('Error in addProductsInBulk:', error.message);
    throw error;
  }
};

const handleBulkUploadFromExcel = async (file) => {
  try {
    const jsonData = await readExcelFile(file);
    console.log('Data parsed from Excel:', jsonData);
    // Transform rows assuming row 0 is headers if applicable
    const headers = jsonData[0] || [];
    const rows = jsonData.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[String(h).toLowerCase()] = row[i];
      });
      return {
        name: obj.name || row[0],
        price: obj.price || row[1],
        description: obj.description || row[2],
        category: obj.category || row[3],
        subcategory: obj.subcategory || row[4],
        imageUrls: obj.imageurls ? String(obj.imageurls).split(',') : [],
      };
    });

    return await addProductsInBulk(rows);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
};

// --------------------------------------------------------------------------
// FETCH PRODUCTS (Normalized for UI & Redux store)
// --------------------------------------------------------------------------
const normalizeProduct = (item) => ({
  id: String(item.id),
  name: item.name,
  price: Number(item.price) || 0,
  description: item.description || '',
  imageUrls: Array.isArray(item.image_urls)
    ? item.image_urls
    : typeof item.image_urls === 'string'
    ? JSON.parse(item.image_urls || '[]')
    : [],
  category: item.category || 'women',
  subcategory: item.subcategory || 'General',
  ownerId: item.owner_id,
  createdAt: item.created_at || new Date().toISOString(),
});

const fetchProducts = async () => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured yet. Returning empty catalog.');
      return { men: [], women: [] };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products from Supabase:', error.message);
      return { men: [], women: [] };
    }

    const normalized = (data || []).map(normalizeProduct);
    const men = normalized.filter((p) => p.category.toLowerCase() === 'men');
    const women = normalized.filter((p) => p.category.toLowerCase() === 'women');

    return { men, women };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return { men: [], women: [] };
  }
};

const fetchMenProducts = async () => {
  const { men } = await fetchProducts();
  return men;
};

const fetchWomenProducts = async () => {
  const { women } = await fetchProducts();
  return women;
};

const fetchProductById = async (id) => {
  try {
    if (!id || !isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching product by ID from Supabase:', error?.message);
      return null;
    }

    return normalizeProduct(data);
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
};

// --------------------------------------------------------------------------
// DATABASE CLEAR / RESET
// --------------------------------------------------------------------------
const clearAllProducts = async () => {
  try {
    console.log('Clearing all products from Supabase...');
    const { error } = await supabase
      .from('products')
      .delete()
      .neq('name', '___NON_EXISTENT_FILTER___');

    if (error) {
      console.error('Error clearing products in Supabase:', error.message);
      throw error;
    }

    console.log('All products cleared successfully from Supabase.');
    return true;
  } catch (error) {
    console.error('Error in clearAllProducts:', error.message);
    throw error;
  }
};

// --------------------------------------------------------------------------
// ORDERS & USER CARTS
// --------------------------------------------------------------------------
const saveOrderToSupabase = async (orderData) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_id: orderData.orderId,
          user_id: orderData.userId,
          total: orderData.total,
          items: orderData.items,
          address: orderData.address,
          status: orderData.status || 'Confirmed',
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving order to Supabase:', error.message);
    throw error;
  }
};

const fetchOrdersForUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((o) => ({
      id: o.id,
      orderId: o.order_id,
      total: o.total,
      items: o.items,
      address: o.address,
      status: o.status,
      date: o.created_at,
    }));
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }
};

const saveUserCart = async (userId, items) => {
  try {
    const { error } = await supabase
      .from('user_carts')
      .upsert({ user_id: userId, items, updated_at: new Date().toISOString() });
    if (error) console.error('Error saving cart to Supabase:', error.message);
  } catch (error) {
    console.error('Error in saveUserCart:', error);
  }
};

const fetchUserCart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_carts')
      .select('items')
      .eq('user_id', userId)
      .single();
    if (error) return [];
    return data?.items || [];
  } catch (error) {
    return [];
  }
};

// Backwards compatibility stubs for unused functions
const updateProductsWithId = async () => {};
const updateAllProductsWithIds = async () => {};
const fetchUsers = async () => [];
const addUserToFirestore = async () => {};

export {
  addProductToSupabase,
  addProductToFirestore,
  addProductsInBulk,
  handleBulkUploadFromExcel,
  uploadImagesAndGetUrls,
  fetchProducts,
  fetchMenProducts,
  fetchWomenProducts,
  fetchProductById,
  clearAllProducts,
  saveOrderToSupabase,
  fetchOrdersForUser,
  saveUserCart,
  fetchUserCart,
  updateProductsWithId,
  updateAllProductsWithIds,
  fetchUsers,
  addUserToFirestore,
};
