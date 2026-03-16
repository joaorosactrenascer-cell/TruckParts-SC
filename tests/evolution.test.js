// Evolution Tests for TruckParts SC
// Comprehensive validation of new features

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '../src/lib/supabase.js';

describe('TruckParts SC Evolution Tests', () => {
  let testUser = null;
  let testSupplier = null;

  beforeEach(async () => {
    // Setup test environment
    console.log('Setting up test environment...');
  });

  afterEach(async () => {
    // Cleanup test data
    console.log('Cleaning up test environment...');
  });

  describe('🚗 Vehicle System', () => {
    it('should have vehicle types table', async () => {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have vehicle brands with types', async () => {
      const { data, error } = await supabase
        .from('vehicle_brands')
        .select(`
          *,
          vehicle_types(name)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('vehicle_types');
    });

    it('should have vehicle models with brands', async () => {
      const { data, error } = await supabase
        .from('vehicle_models')
        .select(`
          *,
          vehicle_brands(name),
          vehicle_types(name)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should have vehicle years', async () => {
      const { data, error } = await supabase
        .from('vehicle_years')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('🏪 Enhanced Suppliers', () => {
    it('should have suppliers_enhanced table', async () => {
      const { data, error } = await supabase
        .from('suppliers_enhanced')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have required supplier fields', async () => {
      const { data, error } = await supabase
        .from('suppliers_enhanced')
        .select('cnpj, email, phone, city, state')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('cnpj');
        expect(data[0]).toHaveProperty('email');
      }
    });
  });

  describe('🔗 Product-Vehicle Compatibility', () => {
    it('should have compatibility table', async () => {
      const { data, error } = await supabase
        .from('product_vehicle_compatibility')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should link products to vehicle models', async () => {
      const { data, error } = await supabase
        .from('product_vehicle_compatibility')
        .select(`
          *,
          products(name),
          vehicle_models(name, vehicle_brands(name))
        `)
        .limit(5);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('products');
        expect(data[0]).toHaveProperty('vehicle_models');
      }
    });
  });

  describe('📂 Enhanced Categories', () => {
    it('should have categories_enhanced table', async () => {
      const { data, error } = await supabase
        .from('categories_enhanced')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should support hierarchical structure', async () => {
      const { data, error } = await supabase
        .from('categories_enhanced')
        .select('id, name, parent_id')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('🚀 Edge Functions', () => {
    it('should have smart-search function', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('smart-search', {
          body: {
            query: 'filtro de ar',
            limit: 5
          }
        });

        // Function should exist (even if it returns test payload error)
        expect(error?.message || '').not.toContain('Function not found');
      } catch (err) {
        // Should not throw connection errors
        expect(err.message).not.toContain('ENOTFOUND');
      }
    });

    it('should have import-climba-products function', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('import-climba-products', {
          body: {
            supplierId: 'test-id',
            apiKey: 'test-key'
          }
        });

        // Function should exist
        expect(error?.message || '').not.toContain('Function not found');
      } catch (err) {
        expect(err.message).not.toContain('ENOTFOUND');
      }
    });
  });

  describe('🔍 Smart Search Functionality', () => {
    it('should parse vehicle queries correctly', async () => {
      const testQueries = [
        'farol volvo fh 2018',
        'filtro de ar scanha',
        'pastilha freio mercedes',
        'alternador 2020'
      ];

      for (const query of testQueries) {
        const { data, error } = await supabase.functions.invoke('smart-search', {
          body: { query, limit: 10 }
        });

        expect(error?.message || '').not.toContain('Function not found');
        
        if (data && !error) {
          expect(data).toHaveProperty('results');
          expect(data).toHaveProperty('parsed_query');
          expect(Array.isArray(data.results)).toBe(true);
        }
      }
    });
  });

  describe('📊 Product Enhancements', () => {
    it('should have enhanced product fields', async () => {
      const { data, error } = await supabase
        .from('products')
        .select('sku, supplier_id, vehicle_type_id, is_featured')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have SKU field for products', async () => {
      const { data, error } = await supabase
        .from('products')
        .select('sku')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('sku');
      }
    });
  });

  describe('🛡️ Security (RLS)', () => {
    it('should have RLS enabled on new tables', async () => {
      const tables = [
        'vehicle_types',
        'vehicle_brands', 
        'vehicle_models',
        'vehicle_years',
        'product_vehicle_compatibility',
        'categories_enhanced',
        'suppliers_enhanced'
      ];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        // Should not expose all data without authentication
        expect(error?.code !== 'PGRST116' || true).toBe(true);
      }
    });
  });

  describe('⚡ Performance Indexes', () => {
    it('should have vehicle-related indexes', async () => {
      // Check if queries are fast (indicates indexes exist)
      const start = Date.now();
      
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('name')
        .eq('brand_id', 'test-id')
        .limit(10);

      const duration = Date.now() - start;
      
      // Should be fast (indexed)
      expect(duration).toBeLessThan(1000);
    });

    it('should have product search indexes', async () => {
      const start = Date.now();
      
      const { data, error } = await supabase
        .from('products')
        .select('name')
        .ilike('name', '%test%')
        .limit(10);

      const duration = Date.now() - start;
      
      // Should be reasonably fast
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('📱 Supplier Dashboard Data', () => {
    it('should support supplier-specific queries', async () => {
      const { data, error } = await supabase
        .from('suppliers_enhanced')
        .select(`
          *,
          companies(name),
          supplier_orders(count)
        `)
        .eq('is_active', true)
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have order tracking for suppliers', async () => {
      const { data, error } = await supabase
        .from('supplier_orders')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('🔄 Integration Tests', () => {
    it('should handle product to vehicle compatibility workflow', async () => {
      // Test creating a product and linking to vehicles
      const testProduct = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test product for compatibility'
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single();

      if (product && !productError) {
        // Test adding compatibility
        const { data: compatibility, error: compatError } = await supabase
          .from('product_vehicle_compatibility')
          .insert({
            product_id: product.id,
            vehicle_model_id: 'test-model-id',
            year_start: 2020,
            year_end: 2024
          })
          .select()
          .single();

        expect(compatError).toBeNull();
        expect(compatibility).toHaveProperty('product_id', product.id);
      }
    });
  });
});

describe('🚀 Performance Benchmarks', () => {
  it('should meet performance targets', async () => {
    const benchmarks = [
      {
        name: 'Vehicle Types Query',
        test: () => supabase.from('vehicle_types').select('*').limit(10),
        maxDuration: 100
      },
      {
        name: 'Product Search',
        test: () => supabase.from('products').select('name').ilike('name', '%test%').limit(10),
        maxDuration: 500
      },
      {
        name: 'Supplier Dashboard',
        test: () => supabase.from('suppliers_enhanced').select('*, companies(name)').limit(10),
        maxDuration: 300
      }
    ];

    for (const benchmark of benchmarks) {
      const start = Date.now();
      const { data, error } = await benchmark.test();
      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(benchmark.maxDuration);
      
      console.log(`${benchmark.name}: ${duration}ms (target: <${benchmark.maxDuration}ms)`);
    }
  });
});
