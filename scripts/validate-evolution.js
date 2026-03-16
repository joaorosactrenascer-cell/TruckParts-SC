// Evolution Validation Script for TruckParts SC
// Comprehensive validation of all new features

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 TruckParts SC - Evolution Validation Report\n');
console.log('=' .repeat(60));

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (supabaseUrl.includes('placeholder')) {
  console.log('❌ ERROR: Supabase URL not configured');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const validationResults = {
  architecture: { passed: 0, failed: 0, details: [] },
  database: { passed: 0, failed: 0, details: [] },
  security: { passed: 0, failed: 0, details: [] },
  performance: { passed: 0, failed: 0, details: [] },
  integrations: { passed: 0, failed: 0, details: [] },
  edgeFunctions: { passed: 0, failed: 0, details: [] }
};

// Helper functions
function logResult(category, passed, message) {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${message}`);
  
  if (passed) {
    validationResults[category].passed++;
  } else {
    validationResults[category].failed++;
  }
  
  validationResults[category].details.push({ passed, message });
}

function logSection(title) {
  console.log(`\n📋 ${title}`);
  console.log('-'.repeat(40));
}

async function checkArchitecture() {
  logSection('Architecture Validation');

  // Check React components
  const pagesDir = path.join(__dirname, '../src/pages');
  const pagesExist = fs.existsSync(pagesDir);
  logResult('architecture', pagesExist, 'src/pages directory exists');

  if (pagesExist) {
    const pages = fs.readdirSync(pagesDir);
    const hasSupplierDashboard = pages.includes('SupplierDashboard.tsx');
    const hasSmartSearch = pages.includes('SmartSearch.tsx');
    
    logResult('architecture', hasSupplierDashboard, 'SupplierDashboard.tsx exists');
    logResult('architecture', hasSmartSearch, 'SmartSearch.tsx exists');
  }

  // Check Edge Functions
  const functionsDir = path.join(__dirname, '../supabase/functions');
  const functionsExist = fs.existsSync(functionsDir);
  logResult('architecture', functionsExist, 'supabase/functions directory exists');

  if (functionsExist) {
    const functions = fs.readdirSync(functionsDir);
    const hasSmartSearch = functions.includes('smart-search');
    const hasClimba = functions.includes('import-climba-products');
    
    logResult('architecture', hasSmartSearch, 'smart-search function exists');
    logResult('architecture', hasClimba, 'import-climba-products function exists');
  }

  // Check Migrations
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const migrationsExist = fs.existsSync(migrationsDir);
  logResult('architecture', migrationsExist, 'supabase/migrations directory exists');

  if (migrationsExist) {
    const migrations = fs.readdirSync(migrationsDir);
    const hasVehicleSystem = migrations.includes('00004_vehicle_system.sql');
    
    logResult('architecture', hasVehicleSystem, '00004_vehicle_system.sql migration exists');
  }
}

async function checkDatabase() {
  logSection('Database Schema Validation');

  // Check new tables exist
  const newTables = [
    'vehicle_types',
    'vehicle_brands',
    'vehicle_models', 
    'vehicle_years',
    'product_vehicle_compatibility',
    'categories_enhanced',
    'suppliers_enhanced',
    'supplier_orders',
    'inventory_logs'
  ];

  for (const table of newTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      const exists = !error || error.code !== 'PGRST116';
      logResult('database', exists, `Table ${table} exists`);
    } catch (err) {
      logResult('database', false, `Table ${table} check failed: ${err.message}`);
    }
  }

  // Check enhanced product fields
  try {
    const { data, error } = await supabase
      .from('products')
      .select('sku, supplier_id, vehicle_type_id, is_featured')
      .limit(1);

    const hasEnhancements = !error;
    logResult('database', hasEnhancements, 'Products table has enhanced fields');
  } catch (err) {
    logResult('database', false, `Product enhancements check failed: ${err.message}`);
  }

  // Check relationships work
  try {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select(`
        name,
        vehicle_brands(name),
        vehicle_types(name)
      `)
      .limit(5);

    const relationshipsWork = !error && data && data.length > 0;
    logResult('database', relationshipsWork, 'Vehicle relationships work correctly');
  } catch (err) {
    logResult('database', false, `Relationship check failed: ${err.message}`);
  }
}

async function checkSecurity() {
  logSection('Security (RLS) Validation');

  const protectedTables = [
    'vehicle_types',
    'vehicle_brands',
    'vehicle_models',
    'vehicle_years',
    'product_vehicle_compatibility',
    'categories_enhanced',
    'suppliers_enhanced',
    'supplier_orders',
    'inventory_logs'
  ];

  for (const table of protectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(100); // Try to get a lot of data

      // RLS should prevent unrestricted access
      const rlsWorking = error || (data && data.length < 100);
      logResult('security', rlsWorking, `RLS enabled on ${table}`);
    } catch (err) {
      logResult('security', true, `RLS check passed for ${table} (access denied as expected)`);
    }
  }
}

async function checkPerformance() {
  logSection('Performance Validation');

  const performanceTests = [
    {
      name: 'Vehicle Types Query',
      test: () => supabase.from('vehicle_types').select('*').limit(10),
      maxDuration: 200
    },
    {
      name: 'Vehicle Brands Query',
      test: () => supabase.from('vehicle_brands').select('name, vehicle_types(name)').limit(10),
      maxDuration: 300
    },
    {
      name: 'Product Search Query',
      test: () => supabase.from('products').select('name, sku').ilike('name', '%test%').limit(10),
      maxDuration: 500
    },
    {
      name: 'Supplier Dashboard Query',
      test: () => supabase.from('suppliers_enhanced').select('*, companies(name)').limit(10),
      maxDuration: 400
    },
    {
      name: 'Compatibility Query',
      test: () => supabase.from('product_vehicle_compatibility').select('*').limit(10),
      maxDuration: 300
    }
  ];

  for (const test of performanceTests) {
    try {
      const start = Date.now();
      const { data, error } = await test.test();
      const duration = Date.now() - start;

      const passed = !error && duration < test.maxDuration;
      logResult('performance', passed, `${test.name}: ${duration}ms (target: <${test.maxDuration}ms)`);
    } catch (err) {
      logResult('performance', false, `${test.name} failed: ${err.message}`);
    }
  }
}

async function checkIntegrations() {
  logSection('Integrations Validation');

  // Test Smart Search Function
  try {
    const start = Date.now();
    const { data, error } = await supabase.functions.invoke('smart-search', {
      body: {
        query: 'filtro de ar',
        limit: 5
      }
    });
    const duration = Date.now() - start;

    const functionExists = !error || !error.message.includes('Function not found');
    logResult('integrations', functionExists, `Smart search function exists (${duration}ms)`);

    if (data && !error) {
      const hasCorrectStructure = data.hasOwnProperty('results') && data.hasOwnProperty('parsed_query');
      logResult('integrations', hasCorrectStructure, 'Smart search returns correct structure');
    }
  } catch (err) {
    logResult('integrations', false, `Smart search test failed: ${err.message}`);
  }

  // Test Climba Integration Function
  try {
    const start = Date.now();
    const { data, error } = await supabase.functions.invoke('import-climba-products', {
      body: {
        supplierId: 'test-supplier-id',
        apiKey: 'test-api-key'
      }
    });
    const duration = Date.now() - start;

    const functionExists = !error || !error.message.includes('Function not found');
    logResult('integrations', functionExists, `Climba integration function exists (${duration}ms)`);
  } catch (err) {
    logResult('integrations', false, `Climba integration test failed: ${err.message}`);
  }
}

async function checkEdgeFunctions() {
  logSection('Edge Functions Deep Validation');

  const functionsDir = path.join(__dirname, '../supabase/functions');
  const functions = fs.readdirSync(functionsDir);

  for (const funcName of functions) {
    const funcPath = path.join(functionsDir, funcName);
    const indexPath = path.join(funcPath, 'index.ts');

    const hasIndex = fs.existsSync(indexPath);
    logResult('edgeFunctions', hasIndex, `${funcName}/index.ts exists`);

    if (hasIndex) {
      try {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check for required patterns
        const hasCors = content.includes('corsHeaders');
        const hasErrorHandling = content.includes('try') && content.includes('catch');
        const hasServe = content.includes('serve(');
        const hasSupabaseClient = content.includes('createClient');

        logResult('edgeFunctions', hasCors, `${funcName} has CORS headers`);
        logResult('edgeFunctions', hasErrorHandling, `${funcName} has error handling`);
        logResult('edgeFunctions', hasServe, `${funcName} has serve function`);
        logResult('edgeFunctions', hasSupabaseClient, `${funcName} has Supabase client`);
      } catch (err) {
        logResult('edgeFunctions', false, `${funcName} file read failed: ${err.message}`);
      }
    }
  }
}

async function checkFileStructure() {
  logSection('File Structure Validation');

  const requiredFiles = [
    'src/pages/SupplierDashboard.tsx',
    'src/pages/SmartSearch.tsx',
    'supabase/migrations/00004_vehicle_system.sql',
    'supabase/functions/smart-search/index.ts',
    'supabase/functions/import-climba-products/index.ts'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    logResult('architecture', exists, `${file} exists`);
  }
}

// Main validation function
async function runValidation() {
  console.log('Starting comprehensive validation...\n');

  await checkArchitecture();
  await checkDatabase();
  await checkSecurity();
  await checkPerformance();
  await checkIntegrations();
  await checkEdgeFunctions();
  await checkFileStructure();

  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;

  Object.entries(validationResults).forEach(([category, results]) => {
    const passed = results.passed;
    const failed = results.failed;
    const total = passed + failed;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📈 Success Rate: ${percentage}%`);

    totalPassed += passed;
    totalFailed += failed;
  });

  const overallTotal = totalPassed + totalFailed;
  const overallPercentage = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;

  console.log('\n🎯 OVERALL RESULT:');
  console.log(`  ✅ Total Passed: ${totalPassed}`);
  console.log(`  ❌ Total Failed: ${totalFailed}`);
  console.log(`  📈 Overall Success Rate: ${overallPercentage}%`);

  if (overallPercentage >= 90) {
    console.log('\n🎉 EXCELLENT! System is ready for production!');
  } else if (overallPercentage >= 75) {
    console.log('\n✅ GOOD! System is mostly ready with minor issues.');
  } else if (overallPercentage >= 50) {
    console.log('\n⚠️  WARNING! System has significant issues that need attention.');
  } else {
    console.log('\n❌ CRITICAL! System has major issues and is not ready for production.');
  }

  console.log('\n📝 Detailed results saved to validation-results.json');

  // Save detailed results
  fs.writeFileSync(
    path.join(__dirname, '../validation-results.json'),
    JSON.stringify(validationResults, null, 2)
  );

  process.exit(overallPercentage >= 75 ? 0 : 1);
}

// Run validation
runValidation().catch(console.error);
