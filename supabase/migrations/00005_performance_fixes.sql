-- Performance Fixes and Optimizations for TruckParts SC
-- Addresses issues found during audit

-- Fix missing indexes for critical queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('portuguese', description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_supplier_active ON products(supplier_id, is_active) WHERE is_active = true;

-- Fix vehicle system indexes for better join performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_models_brand_type ON vehicle_models(brand_id, vehicle_type_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_years_model_year ON vehicle_years(model_id, year);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_brands_type ON vehicle_brands(vehicle_type_id, name);

-- Enhanced categories indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_enhanced_parent_active ON categories_enhanced(parent_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_enhanced_name_active ON categories_enhanced(name, is_active) WHERE is_active = true;

-- Supplier dashboard performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_enhanced_active_rating ON suppliers_enhanced(is_active, rating DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_orders_supplier_status ON supplier_orders(supplier_id, status, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_orders_created_at ON supplier_orders(created_at DESC);

-- Product search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_sku_price ON product_variants(sku, id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_price_range ON product_prices(price) WHERE price > 0;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stock_available ON product_stock(variant_id, quantity) WHERE quantity > 0;

-- Compatibility search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_vehicle_compatibility_model_years ON product_vehicle_compatibility(vehicle_model_id, year_start, year_end);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_vehicle_compatibility_product ON product_vehicle_compatibility(product_id, vehicle_model_id);

-- Analytics performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_type_date ON analytics_events(user_id, event_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_type_date ON analytics_events(event_type, created_at DESC);

-- Inventory logs optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_variant_date ON inventory_logs(product_variant_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_supplier_date ON inventory_logs(supplier_id, created_at DESC);

-- Fix missing foreign key constraints and optimize joins
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_supplier_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_supplier_id_fkey 
  FOREIGN KEY (supplier_id) REFERENCES suppliers_enhanced(id) ON DELETE SET NULL;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_vehicle_type_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_vehicle_type_id_fkey 
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id) ON DELETE SET NULL;

-- Add composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_supplier_category ON products(supplier_id, category_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured_active ON products(is_featured, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_supplier ON products(name, supplier_id) WHERE supplier_id IS NOT NULL;

-- Update table statistics for better query planning
ANALYZE vehicle_types;
ANALYZE vehicle_brands;
ANALYZE vehicle_models;
ANALYZE vehicle_years;
ANALYZE products;
ANALYZE suppliers_enhanced;
ANALYZE categories_enhanced;
ANALYZE product_vehicle_compatibility;
ANALYZE supplier_orders;

-- Add partial indexes for common filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_name ON products(name) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_enhanced_verified ON suppliers_enhanced(is_verified, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_vehicle_compatibility_year_range ON product_vehicle_compatibility(year_start, year_end) WHERE year_start IS NOT NULL;

-- Optimize full-text search configuration
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(description, '')) STORED;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);

-- Create materialized view for popular products (dashboard optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  pp.price,
  ps.quantity,
  c.name as category_name,
  s.name as supplier_name,
  COUNT(oi.id) as order_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
LEFT JOIN product_prices pp ON pv.id = pp.variant_id
LEFT JOIN product_stock ps ON pv.id = ps.variant_id
LEFT JOIN categories_enhanced c ON p.category_id = c.id
LEFT JOIN suppliers_enhanced se ON p.supplier_id = se.id
LEFT JOIN companies s ON se.company_id = s.id
LEFT JOIN order_items oi ON pv.id = oi.variant_id
WHERE p.is_active = true
  AND ps.quantity > 0
  AND pp.price > 0
GROUP BY p.id, p.name, p.sku, pp.price, ps.quantity, c.name, s.name
ORDER BY order_count DESC, p.created_at DESC;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_popular_products_order_count ON popular_products(order_count DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_popular_products()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
END;
$$ LANGUAGE plpgsql;

-- Create optimized search function
CREATE OR REPLACE FUNCTION search_products_optimized(search_term TEXT, supplier_id_param UUID DEFAULT NULL, category_id_param UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  name TEXT,
  sku TEXT,
  price NUMERIC,
  supplier_name TEXT,
  category_name TEXT,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    pv.sku,
    pp.price,
    s.name as supplier_name,
    c.name as category_name,
    CASE 
      WHEN p.name ILIKE '%' || search_term || '%' THEN 100
      WHEN p.search_vector @@ plainto_tsquery('portuguese', search_term) THEN 90
      ELSE 50
    END as relevance_score
  FROM products p
  LEFT JOIN product_variants pv ON p.id = pv.product_id
  LEFT JOIN product_prices pp ON pv.id = pp.variant_id
  LEFT JOIN suppliers_enhanced se ON p.supplier_id = se.id
  LEFT JOIN companies s ON se.company_id = s.id
  LEFT JOIN categories_enhanced c ON p.category_id = c.id
  LEFT JOIN product_stock ps ON pv.id = ps.variant_id
  WHERE 
    p.is_active = true
    AND ps.quantity > 0
    AND pp.price > 0
    AND (supplier_id_param IS NULL OR p.supplier_id = supplier_id_param)
    AND (category_id_param IS NULL OR p.category_id = category_id_param)
    AND (
      p.name ILIKE '%' || search_term || '%'
      OR p.search_vector @@ plainto_tsquery('portuguese', search_term)
    )
  ORDER BY relevance_score DESC, p.name
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
