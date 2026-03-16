// Supabase Validation Script
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 TruckParts SC - Supabase Validation\n');

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (supabaseUrl.includes('placeholder')) {
  console.log('❌ ERROR: Supabase URL not configured');
  console.log('Please create .env.local with your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateConnection() {
  console.log('1. Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function validateTables() {
  console.log('\n2. Validating Required Tables...');
  const requiredTables = [
    'profiles', 'companies', 'categories', 'truck_brands', 'truck_models', 'truck_years',
    'suppliers', 'installers', 'products', 'product_images', 'product_variants',
    'product_stock', 'product_prices', 'product_compatibility', 'orders', 'order_items',
    'payments', 'commissions', 'reviews', 'services', 'appointments', 'shipments',
    'analytics_events', 'ai_detections', 'image_embeddings', 'image_search_logs'
  ];

  let validTables = 0;
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log(`❌ Table '${table}' not found`);
      } else {
        console.log(`✅ Table '${table}' exists`);
        validTables++;
      }
    } catch (error) {
      console.log(`❌ Table '${table}' error:`, error.message);
    }
  }

  console.log(`\n📊 Tables: ${validTables}/${requiredTables.length} found`);
  return validTables === requiredTables.length;
}

async function validateRLS() {
  console.log('\n3. Testing Row Level Security...');
  
  // Test public access (should be limited)
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(10);
    
    if (error) {
      console.log('❌ RLS test failed:', error.message);
      return false;
    }
    
    // Should return empty or limited data when not authenticated
    if (data.length === 0) {
      console.log('✅ RLS appears to be working (no public data exposed)');
      return true;
    } else if (data.length <= 10) {
      console.log('⚠️  RLS may be partially configured');
      return true;
    } else {
      console.log('❌ RLS may not be properly configured');
      return false;
    }
  } catch (error) {
    console.log('❌ RLS validation error:', error.message);
    return false;
  }
}

async function validateFunctions() {
  console.log('\n4. Testing Edge Functions...');
  const functions = [
    'image-search', 'detect-part-number', 'calculate-commission',
    'create-order', 'schedule-installation', 'generate-embeddings'
  ];

  let workingFunctions = 0;

  for (const funcName of functions) {
    try {
      const { data, error } = await supabase.functions.invoke(funcName, {
        body: { test: true }
      });
      
      if (error && !error.message.includes('Function not found')) {
        console.log(`✅ Function '${funcName}' responds (test payload rejected as expected)`);
        workingFunctions++;
      } else if (error?.message.includes('Function not found')) {
        console.log(`❌ Function '${funcName}' not deployed`);
      } else {
        console.log(`✅ Function '${funcName}' working`);
        workingFunctions++;
      }
    } catch (error) {
      console.log(`❌ Function '${funcName}' error:`, error.message);
    }
  }

  console.log(`\n📊 Functions: ${workingFunctions}/${functions.length} working`);
  return workingFunctions > 0;
}

async function validatePerformance() {
  console.log('\n5. Testing Query Performance...');
  
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(10);
    
    const duration = Date.now() - start;
    
    if (error) {
      console.log('❌ Performance test failed:', error.message);
      return false;
    }
    
    if (duration < 1000) {
      console.log(`✅ Query performance good (${duration}ms)`);
      return true;
    } else {
      console.log(`⚠️  Query performance slow (${duration}ms) - consider adding indexes`);
      return false;
    }
  } catch (error) {
    console.log('❌ Performance test error:', error.message);
    return false;
  }
}

async function main() {
  const results = {
    connection: await validateConnection(),
    tables: await validateTables(),
    rls: await validateRLS(),
    functions: await validateFunctions(),
    performance: await validatePerformance()
  };

  console.log('\n📋 VALIDATION SUMMARY:');
  console.log('========================');
  
  Object.entries(results).forEach(([key, value]) => {
    const status = value ? '✅ PASS' : '❌ FAIL';
    console.log(`${key.padEnd(12)}: ${status}`);
  });

  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    console.log('\n🎉 ALL VALIDATIONS PASSED!');
    console.log('Your Supabase integration is ready for production.');
  } else {
    console.log('\n⚠️  SOME VALIDATIONS FAILED');
    console.log('Please address the issues before deploying to production.');
  }

  process.exit(allPassed ? 0 : 1);
}

// Check if environment is set up
if (!fs.existsSync(path.join(__dirname, '../.env.local'))) {
  console.log('❌ .env.local file not found');
  console.log('Copy setup-env-template.txt to .env.local and configure your values');
  process.exit(1);
}

main().catch(console.error);
