-- Complete RLS Policies for TruckParts SC
-- This migration adds comprehensive Row Level Security

-- Enable RLS on all tables
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

-- Companies Policies
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert companies" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update companies" ON companies FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Suppliers Policies  
CREATE POLICY "Suppliers are viewable by everyone" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Suppliers can view their own profile" ON suppliers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all suppliers" ON suppliers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Installers Policies
CREATE POLICY "Installers are viewable by everyone" ON installers FOR SELECT USING (true);
CREATE POLICY "Installers can view their own profile" ON installers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all installers" ON installers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Truck Brands/Models/Years Policies
CREATE POLICY "Truck data is viewable by everyone" ON truck_brands FOR SELECT USING (true);
CREATE POLICY "Truck data is viewable by everyone" ON truck_models FOR SELECT USING (true);
CREATE POLICY "Truck data is viewable by everyone" ON truck_years FOR SELECT USING (true);
CREATE POLICY "Admins can manage truck data" ON truck_brands FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage truck data" ON truck_models FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage truck data" ON truck_years FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Products and Related Tables
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);
CREATE POLICY "Product variants are viewable by everyone" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Product stock is viewable by authenticated users" ON product_stock FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Product prices are viewable by authenticated users" ON product_prices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Product compatibility is viewable by everyone" ON product_compatibility FOR SELECT USING (true);

CREATE POLICY "Suppliers can manage their product images" ON product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.supplier_id = auth.uid())
);
CREATE POLICY "Suppliers can manage their product variants" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.supplier_id = auth.uid())
);
CREATE POLICY "Suppliers can manage their stock" ON product_stock FOR ALL USING (
  EXISTS (SELECT 1 FROM product_variants WHERE product_variants.id = product_stock.variant_id AND 
    EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.supplier_id = auth.uid()))
);
CREATE POLICY "Suppliers can manage their prices" ON product_prices FOR ALL USING (
  EXISTS (SELECT 1 FROM product_variants WHERE product_variants.id = product_prices.variant_id AND
    EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.supplier_id = auth.uid()))
);

-- Orders Policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Suppliers can view orders for their products" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM order_items WHERE order_items.order_id = orders.id AND
    EXISTS (SELECT 1 FROM products WHERE products.id = order_items.product_id AND products.supplier_id = auth.uid()))
);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update their orders" ON orders FOR UPDATE USING (auth.uid() = customer_id);

-- Order Items Policies
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Suppliers can view their order items" ON order_items FOR SELECT USING (auth.uid() = supplier_id);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Payments Policies
CREATE POLICY "Users can view their payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins can manage all payments" ON payments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Commissions Policies
CREATE POLICY "Suppliers can view their commissions" ON commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM order_items WHERE order_items.id = commissions.order_item_id AND order_items.supplier_id = auth.uid())
);
CREATE POLICY "Admins can manage all commissions" ON commissions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their orders" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update their reviews" ON reviews FOR UPDATE USING (auth.uid() = customer_id);

-- Services Policies
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Installers can manage their services" ON services FOR ALL USING (auth.uid() = installer_id);
CREATE POLICY "Admins can manage all services" ON services FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Appointments Policies
CREATE POLICY "Users can view their appointments" ON appointments FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Installers can view their appointments" ON appointments FOR SELECT USING (auth.uid() = installer_id);
CREATE POLICY "Users can create appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Installers can update appointment status" ON appointments FOR UPDATE USING (auth.uid() = installer_id);

-- Shipments Policies
CREATE POLICY "Users can view their shipments" ON shipments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins can manage all shipments" ON shipments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Analytics and AI Tables
CREATE POLICY "Users can view their analytics events" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create analytics events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "AI detections are viewable by authenticated users" ON ai_detections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage AI detections" ON ai_detections FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Image embeddings are viewable by authenticated users" ON image_embeddings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage image embeddings" ON image_embeddings FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their search logs" ON image_search_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create search logs" ON image_search_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
