-- Vehicle System Tables for TruckParts SC
-- Evolution of existing architecture

-- Vehicle Types (Truck, Bus, Van, etc.)
CREATE TABLE IF NOT EXISTS vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Brands (Volvo, Scania, Mercedes, etc.)
CREATE TABLE IF NOT EXISTS vehicle_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  vehicle_type_id UUID REFERENCES vehicle_types(id) ON DELETE CASCADE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Models (FH, FH16, R-series, etc.)
CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_id UUID REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  vehicle_type_id UUID REFERENCES vehicle_types(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Years
CREATE TABLE IF NOT EXISTS vehicle_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES vehicle_models(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(model_id, year)
);

-- Product-Vehicle Compatibility (Enhanced version)
CREATE TABLE IF NOT EXISTS product_vehicle_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  vehicle_model_id UUID REFERENCES vehicle_models(id) ON DELETE CASCADE,
  year_start INTEGER CHECK (year_start >= 1900 AND year_start <= 2100),
  year_end INTEGER CHECK (year_end >= 1900 AND year_end <= 2100),
  compatibility_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, vehicle_model_id, year_start, year_end)
);

-- Enhanced Categories (Hierarchical)
CREATE TABLE IF NOT EXISTS categories_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories_enhanced(id) ON DELETE CASCADE,
  description TEXT,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Suppliers with CNPJ and additional fields
CREATE TABLE IF NOT EXISTS suppliers_enhanced (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  cnpj TEXT UNIQUE, -- Brazilian company identifier
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  logo_url TEXT,
  website TEXT,
  business_hours JSONB, -- Store opening hours
  specialties TEXT[], -- Array of specialties
  rating NUMERIC(3,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Enhancements
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers_enhanced(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS vehicle_type_id UUID REFERENCES vehicle_types(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Stock Management
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers_enhanced(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Orders Tracking
CREATE TABLE IF NOT EXISTS supplier_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers_enhanced(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial vehicle types
INSERT INTO vehicle_types (name, description) VALUES 
('Caminhão', 'Veículos de carga pesada'),
('Carreta', 'Reboques e semi-reboques'),
('Van', 'Veículos de carga leve'),
('Ônibus', 'Veículos de transporte de passageiros'),
('Pickup', 'Picapes e utilitários')
ON CONFLICT (name) DO NOTHING;

-- Insert initial truck brands
INSERT INTO vehicle_brands (name, vehicle_type_id, logo_url) 
SELECT 
  brand_name,
  vt.id,
  'https://example.com/logos/' || lower(brand_name) || '.png'
FROM vehicle_types vt, 
(VALUES 
  ('Volvo'), ('Scania'), ('Mercedes-Benz'), ('MAN'), ('Iveco'), 
  ('DAF'), ('VolksWagen'), ('Ford'), ('Toyota')
) AS brands(brand_name)
WHERE vt.name = 'Caminhão'
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_vehicle_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Vehicle Tables
CREATE POLICY "Vehicle types are viewable by everyone" ON vehicle_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle types" ON vehicle_types FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Vehicle brands are viewable by everyone" ON vehicle_brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle brands" ON vehicle_brands FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Vehicle models are viewable by everyone" ON vehicle_models FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle models" ON vehicle_models FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Vehicle years are viewable by everyone" ON vehicle_years FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle years" ON vehicle_years FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- RLS for Enhanced Categories
CREATE POLICY "Categories are viewable by everyone" ON categories_enhanced FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON categories_enhanced FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- RLS for Enhanced Suppliers
CREATE POLICY "Suppliers are viewable by everyone" ON suppliers_enhanced FOR SELECT USING (is_active = true);
CREATE POLICY "Suppliers can view their own profile" ON suppliers_enhanced FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Suppliers can update their own profile" ON suppliers_enhanced FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all suppliers" ON suppliers_enhanced FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- RLS for Product-Vehicle Compatibility
CREATE POLICY "Product compatibility is viewable by everyone" ON product_vehicle_compatibility FOR SELECT USING (true);
CREATE POLICY "Suppliers can manage their product compatibility" ON product_vehicle_compatibility FOR ALL USING (
  EXISTS (
    SELECT 1 FROM products p 
    WHERE p.id = product_vehicle_compatibility.product_id 
    AND p.supplier_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all compatibility" ON product_vehicle_compatibility FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_brands_type_id ON vehicle_brands(vehicle_type_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_models_brand_id ON vehicle_models(brand_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_models_type_id ON vehicle_models(vehicle_type_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_years_model_id ON vehicle_years(model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_years_year ON vehicle_years(year);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_vehicle_compatibility_product_id ON product_vehicle_compatibility(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_vehicle_compatibility_model_id ON product_vehicle_compatibility(vehicle_model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_vehicle_compatibility_years ON product_vehicle_compatibility(year_start, year_end);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_enhanced_parent_id ON categories_enhanced(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_enhanced_slug ON categories_enhanced(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_enhanced_cnpj ON suppliers_enhanced(cnpj);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_enhanced_is_active ON suppliers_enhanced(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_vehicle_type_id ON products(vehicle_type_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_variant_id ON inventory_logs(product_variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_supplier_id ON inventory_logs(supplier_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_orders_supplier_id ON supplier_orders(supplier_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_orders_status ON supplier_orders(status);
