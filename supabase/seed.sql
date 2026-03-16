-- Seed data for TruckParts SC
-- This file is referenced in config.toml for database seeding

-- Insert Categories
INSERT INTO categories (id, name, slug, parent_id) VALUES
(gen_random_uuid(), 'Engine Parts', 'engine-parts', NULL),
(gen_random_uuid(), 'Transmission', 'transmission', NULL),
(gen_random_uuid(), 'Brakes', 'brakes', NULL),
(gen_random_uuid(), 'Suspension', 'suspension', NULL),
(gen_random_uuid(), 'Electrical', 'electrical', NULL),
(gen_random_uuid(), 'Body Parts', 'body-parts', NULL);

-- Insert Truck Brands
INSERT INTO truck_brands (id, name) VALUES
(gen_random_uuid(), 'Volvo'),
(gen_random_uuid(), 'Scania'),
(gen_random_uuid(), 'Mercedes-Benz'),
(gen_random_uuid(), 'MAN'),
(gen_random_uuid(), 'Iveco'),
(gen_random_uuid(), 'DAF');

-- Insert sample companies
INSERT INTO companies (id, name, tax_id, address, city, country) VALUES
(gen_random_uuid(), 'TruckParts Supplier A', '123456789', '123 Main St', 'São Paulo', 'Brazil'),
(gen_random_uuid(), 'Quality Truck Parts', '987654321', '456 Industrial Ave', 'São Paulo', 'Brazil');

-- Enable RLS for all tables that don't have it yet
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_search_logs ENABLE ROW LEVEL SECURITY;
