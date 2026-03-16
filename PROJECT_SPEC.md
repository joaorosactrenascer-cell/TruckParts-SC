# TRUCKPARTS SC - Project Specification

## Overview
TRUCKPARTS SC is a production-grade marketplace platform connecting truck drivers with suppliers of truck parts and installation services.

## Architecture
- **Frontend:** React, Vite, TypeScript, TailwindCSS, Shadcn UI
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions)
- **AI Module:** Visual detection, OCR, and image similarity search for truck parts.

## Features
- **Users:** Search truck parts (by name, model, image), buy parts, schedule installation.
- **Suppliers:** Create accounts, upload products, manage orders, view analytics.
- **Installers:** Receive installation requests, manage schedules.

## Database Schema
- profiles, roles, companies, suppliers, categories, products, product_images, product_variants, product_stock, product_prices, truck_brands, truck_models, truck_years, product_compatibility, orders, order_items, payments, commissions, reviews, services, installers, appointments, shipments, analytics_events
- AI Tables: ai_detections, image_embeddings, image_search_logs

## Edge Functions
- image-search
- detect-part-number
- generate-embeddings
- create-order
- schedule-installation
- calculate-commission

## Frontend Pages
- Home, Search, Product page, Supplier page, Cart, Checkout, Orders, Supplier dashboard, Admin dashboard, Installation booking
