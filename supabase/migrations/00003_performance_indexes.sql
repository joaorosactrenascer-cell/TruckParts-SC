-- Performance Indexes for TruckParts SC
-- This migration adds critical indexes for performance optimization

-- Product Search Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('english', description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_part_number ON products(part_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_oem_number ON products(oem_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Product Variants and Stock
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stock_variant_id ON product_stock(variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_variant_id ON product_prices(variant_id);

-- Product Compatibility
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_compatibility_product_id ON product_compatibility(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_compatibility_model_id ON product_compatibility(model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_compatibility_years ON product_compatibility(year_start, year_end);

-- Orders Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Order Items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_supplier_id ON order_items(supplier_id);

-- User Profiles and Roles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Suppliers and Installers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_rating ON suppliers(rating);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_is_verified ON suppliers(is_verified);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_installers_company_id ON installers(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_installers_rating ON installers(rating);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_installers_hourly_rate ON installers(hourly_rate);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_installers_is_verified ON installers(is_verified);

-- Categories Hierarchy
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Truck Data Relationships
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_truck_models_brand_id ON truck_models(brand_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_truck_years_model_id ON truck_years(model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_truck_years_year ON truck_years(year);

-- Appointments and Services
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_installer_id ON appointments(installer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_installer_id ON services(installer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_base_price ON services(base_price);

-- Reviews
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Analytics and AI
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_detections_created_at ON ai_detections(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_embeddings_product_image_id ON image_embeddings(product_image_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_search_logs_user_id ON image_search_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_search_logs_created_at ON image_search_logs(created_at);

-- Vector Index for Image Search (pgvector)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_image_embeddings_vector ON image_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Composite Indexes for Common Queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_supplier_category ON products(supplier_id, category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_installer_status ON appointments(installer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_scheduled_status ON appointments(scheduled_at, status);

-- Payment and Commission Tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_order_item_id ON commissions(order_item_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_created_at ON commissions(created_at);

-- Shipment Tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shipments_estimated_delivery ON shipments(estimated_delivery);

-- Product Images
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_created_at ON product_images(created_at);
