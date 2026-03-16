-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'supplier', 'installer', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE appointment_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'customer',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tax_id TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  rating NUMERIC(3,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Installers
CREATE TABLE installers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  rating NUMERIC(3,2) DEFAULT 0,
  hourly_rate NUMERIC(10,2),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Truck Brands, Models, Years
CREATE TABLE truck_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE truck_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES truck_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE truck_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES truck_models(id) ON DELETE CASCADE,
  year INTEGER NOT NULL
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  part_number TEXT,
  oem_number TEXT,
  condition TEXT CHECK (condition IN ('new', 'used', 'refurbished')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  attributes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Stock
CREATE TABLE product_stock (
  variant_id UUID PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  reserved INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Prices
CREATE TABLE product_prices (
  variant_id UUID PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  discount_price NUMERIC(10,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Compatibility
CREATE TABLE product_compatibility (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  model_id UUID REFERENCES truck_models(id) ON DELETE CASCADE,
  year_start INTEGER,
  year_end INTEGER,
  PRIMARY KEY (product_id, model_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  status order_status DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  supplier_id UUID REFERENCES suppliers(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(10,2) NOT NULL,
  provider TEXT,
  status TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commissions
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  customer_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id UUID REFERENCES installers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2),
  estimated_hours NUMERIC(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  installer_id UUID REFERENCES installers(id),
  service_id UUID REFERENCES services(id),
  order_id UUID REFERENCES orders(id), -- Optional, if linked to a part purchase
  scheduled_at TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  tracking_number TEXT,
  carrier TEXT,
  status TEXT,
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Tables
CREATE TABLE ai_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  detected_parts JSONB,
  ocr_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE image_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_image_id UUID REFERENCES product_images(id) ON DELETE CASCADE,
  embedding vector(1536), -- Assuming OpenAI embeddings size
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE image_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  image_url TEXT,
  search_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Examples)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Suppliers can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = supplier_id);
CREATE POLICY "Suppliers can update their own products" ON products FOR UPDATE USING (auth.uid() = supplier_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
