// Supabase Audit Script
// This script validates the Supabase integration

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 TruckParts SC - Supabase Audit Report\n');

// 1. Check environment variables
console.log('1. Environment Variables:');
const envExamplePath = path.join(__dirname, '../.env.example');
const envLocalPath = path.join(__dirname, '../.env.local');

if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example exists');
} else {
  console.log('❌ .env.example missing');
}

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local exists');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
    console.log('✅ Supabase variables configured');
  } else {
    console.log('❌ Supabase variables missing');
  }
} else {
  console.log('❌ .env.local missing - create with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// 2. Check Supabase config
console.log('\n2. Supabase Configuration:');
const configPath = path.join(__dirname, '../supabase/config.toml');
if (fs.existsSync(configPath)) {
  console.log('✅ supabase/config.toml exists');
  const config = fs.readFileSync(configPath, 'utf8');
  if (config.includes('project_id = "truckparts-sc"')) {
    console.log('✅ Project ID configured');
  } else {
    console.log('❌ Project ID not configured');
  }
} else {
  console.log('❌ supabase/config.toml missing');
}

// 3. Check migrations
console.log('\n3. Database Migrations:');
const migrationsPath = path.join(__dirname, '../supabase/migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath);
  console.log(`✅ Found ${migrations.length} migration(s):`);
  migrations.forEach(m => console.log(`   - ${m}`));
  
  // Check migration content
  const initialMigration = path.join(migrationsPath, '00001_initial_schema.sql');
  if (fs.existsSync(initialMigration)) {
    const migration = fs.readFileSync(initialMigration, 'utf8');
    const rlsCount = (migration.match(/ENABLE ROW LEVEL SECURITY/g) || []).length;
    const policyCount = (migration.match(/CREATE POLICY/g) || []).length;
    console.log(`✅ RLS enabled on ${rlsCount} tables`);
    console.log(`✅ ${policyCount} policies defined`);
  }
} else {
  console.log('❌ No migrations found');
}

// 4. Check Edge Functions
console.log('\n4. Edge Functions:');
const functionsPath = path.join(__dirname, '../supabase/functions');
if (fs.existsSync(functionsPath)) {
  const functions = fs.readdirSync(functionsPath);
  console.log(`✅ Found ${functions.length} function(s):`);
  functions.forEach(f => {
    const indexPath = path.join(functionsPath, f, 'index.ts');
    if (fs.existsSync(indexPath)) {
      console.log(`   ✅ ${f}/index.ts`);
    } else {
      console.log(`   ❌ ${f} (missing index.ts)`);
    }
  });
} else {
  console.log('❌ No functions found');
}

// 5. Check client configuration
console.log('\n5. Client Configuration:');
const clientPath = path.join(__dirname, '../src/lib/supabase.ts');
if (fs.existsSync(clientPath)) {
  console.log('✅ src/lib/supabase.ts exists');
  const client = fs.readFileSync(clientPath, 'utf8');
  if (client.includes('createClient')) {
    console.log('✅ Supabase client properly configured');
  }
} else {
  console.log('❌ src/lib/supabase.ts missing');
}

// 6. Check package dependencies
console.log('\n6. Dependencies:');
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (pkg.dependencies['@supabase/supabase-js']) {
    console.log('✅ @supabase/supabase-js installed');
  } else {
    console.log('❌ @supabase/supabase-js missing');
  }
}

console.log('\n📋 Audit Complete!');
console.log('\nNext Steps:');
console.log('1. Create .env.local with your Supabase credentials');
console.log('2. Run: supabase start (for local development)');
console.log('3. Run: supabase db push (to apply migrations)');
console.log('4. Run: supabase functions deploy (to deploy functions)');
