-- ==============================================================================
-- KnitNations Supabase Schema Setup Script
-- Run this script in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    image_urls JSONB DEFAULT '[]'::jsonb,
    category TEXT NOT NULL,       -- 'men' or 'women'
    subcategory TEXT NOT NULL,    -- 'Jeans', 'Tops', 'Skirts', 'Cargo', etc.
    owner_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for fast querying by category & subcategory
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products (subcategory);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" 
ON public.products FOR SELECT 
USING (true);

-- Allow inserting, updating, and deleting products
DROP POLICY IF EXISTS "Allow product modifications" ON public.products;
CREATE POLICY "Allow product modifications" 
ON public.products FOR ALL 
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    total NUMERIC NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    address JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'Confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders or all for service
DROP POLICY IF EXISTS "Allow users to view orders" ON public.orders;
CREATE POLICY "Allow users to view orders" 
ON public.orders FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow inserting orders" ON public.orders;
CREATE POLICY "Allow inserting orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. USER CARTS TABLE (For cart persistence across devices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_carts (
    user_id TEXT PRIMARY KEY,
    items JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to user_carts" ON public.user_carts;
CREATE POLICY "Allow all access to user_carts" 
ON public.user_carts FOR ALL 
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET FOR PRODUCT IMAGES
-- ------------------------------------------------------------------------------
-- Create the 'product-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Allow public access to view uploaded product images
DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
CREATE POLICY "Public Access to Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Storage RLS: Allow uploads to product-images bucket
DROP POLICY IF EXISTS "Allow uploads to Product Images" ON storage.objects;
CREATE POLICY "Allow uploads to Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow updates/deletes in Product Images" ON storage.objects;
CREATE POLICY "Allow updates/deletes in Product Images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images');

-- ==============================================================================
-- HELPER COMMANDS:
-- 
-- 1. TO CLEAR / RESET ALL PRODUCTS:
--    TRUNCATE TABLE public.products CASCADE;
--
-- 2. TO CLEAR / RESET ALL ORDERS:
--    TRUNCATE TABLE public.orders CASCADE;
-- ==============================================================================
