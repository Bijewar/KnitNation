"use client";

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Plus, 
  Upload, 
  Trash2, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  RefreshCw,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { onAuthStateChange, getCurrentUser, isSupabaseConfigured } from '../../supabase';
import { 
  addProductToSupabase, 
  addProductsInBulk, 
  uploadImagesAndGetUrls, 
  clearAllProducts 
} from '../../stores';
import { MyntraSpinner } from '../comp/MyntraLoader';

const generateUniqueID = () => {
  return Math.random().toString(36).substring(2, 11);
};

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'bijewarmanas1@gmail.com').toLowerCase();

const AddProductPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('women');
  const [subcategory, setSubcategory] = useState('Jeans');
  const [user, setUser] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // 'single', 'bulk', 'danger'
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const evaluateAdmin = (currentUser) => {
      setUser(currentUser);
      const isDev = process.env.NODE_ENV === 'development';
      const isUserAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL || isDev;
      setIsAdmin(isUserAdmin);
      setAuthLoading(false);
    };

    getCurrentUser().then(evaluateAdmin);

    const subscription = onAuthStateChange((currentUser) => {
      evaluateAdmin(currentUser);
    });

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  // Handle image files selection
  const handleImageChange = async (e) => {
    try {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        const dataURL = await readFileAsDataURL(file);
        setImages((prev) => [
          ...prev,
          { id: generateUniqueID(), name: file.name, dataURL },
        ]);
      }
    } catch (error) {
      console.error('Error reading image files:', error);
      toast.error('Failed to read image file');
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Add single product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category || !subcategory) {
      toast.error('Please fill in all required fields (Name, Price, Category, Subcategory)');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Uploading images and saving product...');

    try {
      let imageUrlsToUse = [];
      if (images.length > 0) {
        imageUrlsToUse = await uploadImagesAndGetUrls(images);
      }

      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        imageUrls: imageUrlsToUse,
        category: category.toLowerCase(),
        subcategory: subcategory.trim(),
        ownerId: user?.email || ADMIN_EMAIL,
      };

      const newId = await addProductToSupabase(productData, category);
      toast.success(`Product "${name}" added successfully! (ID: ${newId.substring(0, 8)})`, { id: toastId });

      // Reset form
      setName('');
      setPrice('');
      setDescription('');
      setImages([]);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(`Failed to add product: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk upload from Excel
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error('Please select an Excel (.xlsx) file first');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Reading Excel file and saving products...');

    try {
      const data = await readFileAsArrayBuffer(bulkFile);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet);

      if (!rawRows || rawRows.length === 0) {
        throw new Error('No product rows found in Excel sheet');
      }

      const formattedProducts = rawRows.map((row) => {
        const rowCategory = String(row.Category || row.category || 'women').toLowerCase();
        const rowSubcategory = String(row.Subcategory || row.subcategory || 'General');
        const rawImgs = row.ImageUrls || row.imageUrls || row.image_urls || '';
        const imgArray = typeof rawImgs === 'string' && rawImgs ? rawImgs.split(',').map((s) => s.trim()) : [];

        return {
          name: String(row.Name || row.name || 'Unnamed Product'),
          price: parseFloat(row.Price || row.price) || 0,
          description: String(row.Description || row.description || ''),
          category: rowCategory,
          subcategory: rowSubcategory,
          imageUrls: imgArray,
          ownerId: user?.email || ADMIN_EMAIL,
        };
      });

      const count = await addProductsInBulk(formattedProducts);
      toast.success(`Successfully uploaded ${count} products!`, { id: toastId });
      setBulkFile(null);
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast.error(`Bulk upload failed: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(new Uint8Array(e.target.result));
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  // Clear all products from database
  const handleClearDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: Are you sure you want to CLEAR ALL PRODUCTS from the database? This action cannot be undone.'
    );
    if (!confirmed) return;

    setIsClearing(true);
    const toastId = toast.loading('Clearing all products from database...');

    try {
      await clearAllProducts();
      toast.success('Database cleared! All products have been removed.', { id: toastId });
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error(`Failed to clear database: ${error.message}`, { id: toastId });
    } finally {
      setIsClearing(false);
    }
  };

  // Loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <MyntraSpinner text="Verifying admin access..." />
      </div>
    );
  }

  // Access Restricted View if not bijewarmanas1@gmail.com
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col justify-center items-center px-4 font-sans">
        <Toaster position="top-right" />
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            This dashboard is restricted to the administrator account (<strong>{ADMIN_EMAIL}</strong>).
          </p>
          
          {user ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-6">
              Currently signed in as: <strong>{user.email}</strong>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 mb-6">
              You are not currently signed in.
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-2.5 bg-[#ff3f6c] text-white font-bold rounded-lg shadow hover:bg-[#e0355e] transition text-sm flex items-center justify-center gap-2"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/home"
              className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full Admin Dashboard
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#282c3f] font-sans pb-16">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#ff3f6c]" />
              <h1 className="text-lg font-bold">Product Management Dashboard</h1>
            </div>
          </div>
          <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-600" /> Admin: {user?.email || ADMIN_EMAIL}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-8 pb-1">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'single'
                ? 'text-[#ff3f6c] border-b-2 border-[#ff3f6c] bg-white'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <Plus className="w-4 h-4" /> Add Single Product
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'bulk'
                ? 'text-[#ff3f6c] border-b-2 border-[#ff3f6c] bg-white'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <Upload className="w-4 h-4" /> Bulk Excel Upload
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ml-auto ${
              activeTab === 'danger'
                ? 'text-red-600 border-b-2 border-red-600 bg-white'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Reset / Clear Database
          </button>
        </div>

        {/* Tab 1: Single Product */}
        {activeTab === 'single' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-2">Create New Product</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter product details and upload photos to add it directly to your Supabase catalog.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vintage Straight Fit Jeans"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value === 'men') setSubcategory('Jeans');
                      if (e.target.value === 'women') setSubcategory('Jeans');
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                  >
                    {category === 'women' ? (
                      <>
                        <option value="Jeans">Jeans</option>
                        <option value="Tops">Tops</option>
                        <option value="Cargo">Cargo</option>
                        <option value="Curve">Curve</option>
                        <option value="Skirts">Skirts</option>
                        <option value="Shirts">Shirts</option>
                      </>
                    ) : (
                      <>
                        <option value="Jeans">Jeans</option>
                        <option value="Shirts">Shirts</option>
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Shorts">Shorts</option>
                        <option value="Cargo">Cargo</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Fabric composition, fit details, model size info..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#ff3f6c] transition-colors cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-[#ff3f6c]">Click to browse files</span>
                    <span className="text-xs text-gray-500 block mt-1">PNG, JPG, WEBP up to 10MB each</span>
                  </label>
                </div>

                {/* Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                        <img src={img.dataURL} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-90 hover:opacity-100 hover:bg-red-600 transition"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-3 bg-[#ff3f6c] text-white font-bold rounded-lg shadow hover:bg-[#e0355e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Adding Product...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Publish Product to Store
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Bulk Excel Upload */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-2">Bulk Upload Products via Excel</h2>
            <p className="text-sm text-gray-500 mb-6">
              Upload an Excel (.xlsx) file containing your product catalog to add multiple products in a single batch.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900">
              <p className="font-semibold mb-1">Expected Excel Columns:</p>
              <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 inline-block font-mono">
                Name | Price | Category (men/women) | Subcategory | Description | ImageUrls
              </code>
              <p className="text-xs text-blue-700 mt-2">
                Tip: The <code>ImageUrls</code> column can contain comma-separated image URLs (e.g. <code>https://... , https://...</code>).
              </p>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-6">
              <div>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !bulkFile}
                className="px-6 py-2.5 bg-[#282c3f] text-white font-bold rounded-lg shadow hover:bg-black transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading Batch...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Upload & Parse Excel File
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Danger Zone / Clear DB */}
        {activeTab === 'danger' && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 md:p-8">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Clear & Reset Database</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will wipe all product entries from the Supabase <code>products</code> table so you can start completely fresh.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-900">
              <p className="font-bold mb-1">Notice:</p>
              <p className="text-xs">
                Once confirmed, all existing products will be permanently deleted from the database.
              </p>
            </div>

            <button
              type="button"
              disabled={isClearing}
              onClick={handleClearDatabase}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Clearing Products...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Clear All Products from Database
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddProductPage;
