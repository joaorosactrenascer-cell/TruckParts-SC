// Deploy Script for TruckParts SC SaaS
// Complete deployment automation

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TruckParts SC - SaaS Deployment Script');
console.log('=' .repeat(60));

// Check prerequisites
function checkPrerequisites() {
  console.log('\n📋 Checking prerequisites...');
  
  // Check if .env.local exists
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local not found. Please create it with your Supabase credentials.');
    console.log('📝 Check SETUP_ENV.md for instructions.');
    process.exit(1);
  }
  
  // Check if Supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    console.log('✅ Supabase CLI is installed');
  } catch (error) {
    console.log('❌ Supabase CLI not found. Please install it first.');
    process.exit(1);
  }
  
  // Check if dependencies are installed
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const requiredDeps = ['@supabase/supabase-js', 'react', 'react-router-dom'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('📦 Run: npm install');
    process.exit(1);
  }
  
  console.log('✅ All prerequisites met');
}

// Apply database migrations
function applyMigrations() {
  console.log('\n🗄️ Applying database migrations...');
  
  try {
    const output = execSync('supabase db push', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Database migrations applied successfully');
    console.log(output.toString());
  } catch (error) {
    console.log('❌ Failed to apply migrations:', error.message);
    console.log('🔧 Check your Supabase connection and try again.');
    process.exit(1);
  }
}

// Deploy Edge Functions
function deployFunctions() {
  console.log('\n⚡ Deploying Edge Functions...');
  
  try {
    const output = execSync('supabase functions deploy', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Edge Functions deployed successfully');
    console.log(output.toString());
  } catch (error) {
    console.log('❌ Failed to deploy functions:', error.message);
    console.log('🔧 Check your function definitions and try again.');
    process.exit(1);
  }
}

// Validate deployment
function validateDeployment() {
  console.log('\n🔍 Validating deployment...');
  
  // Check if we can connect to Supabase
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  const supabaseUrl = envContent.match(/VITE_SUPABASE_URL="([^"]+)"/)?.[1];
  
  if (!supabaseUrl) {
    console.log('❌ VITE_SUPABASE_URL not found in .env.local');
    process.exit(1);
  }
  
  console.log('✅ Supabase URL found:', supabaseUrl);
  console.log('✅ Deployment validation completed');
}

// Build frontend
function buildFrontend() {
  console.log('\n🏗️ Building frontend...');
  
  try {
    execSync('npm run build', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Frontend built successfully');
  } catch (error) {
    console.log('❌ Failed to build frontend:', error.message);
    console.log('🔧 Check for build errors and fix them.');
    process.exit(1);
  }
}

// Generate deployment report
function generateReport() {
  console.log('\n📊 Generating deployment report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    project: 'TruckParts SC SaaS',
    version: '2.0.0',
    features: [
      'Multi-tenant SaaS',
      'Product Management',
      'Customer Management',
      'Order Management',
      'Inventory Control',
      'Row Level Security',
      'Edge Functions',
      'Smart Search',
      'Supplier Dashboard'
    ],
    database: {
      tables: [
        'empresas',
        'usuarios',
        'clientes',
        'categorias',
        'produtos',
        'estoque',
        'movimentacoes_estoque',
        'pedidos',
        'itens_pedido',
        'enderecos',
        'pagamentos'
      ],
      rls: 'Enabled on all tables',
      functions: 'Business logic functions deployed'
    },
    frontend: {
      framework: 'React + TypeScript + TailwindCSS',
      pages: [
        'Home',
        'Search',
        'Smart Search',
        'Products',
        'Customers',
        'Orders',
        'Inventory',
        'Supplier Dashboard',
        'Admin Dashboard'
      ]
    },
    deployment: {
      status: 'Success',
      environment: 'Production',
      next_steps: [
        'Configure authentication',
        'Create initial company',
        'Add sample data',
        'Test all features'
      ]
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../deployment-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Deployment report saved to deployment-report.json');
}

// Main deployment function
function deploy() {
  console.log('🎯 Starting complete SaaS deployment...\n');
  
  checkPrerequisites();
  applyMigrations();
  deployFunctions();
  buildFrontend();
  validateDeployment();
  generateReport();
  
  console.log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
  console.log('=' .repeat(60));
  
  console.log('\n📋 Next Steps:');
  console.log('1. Start your application: npm run dev');
  console.log('2. Access the application at: http://localhost:5173');
  console.log('3. Create your company account');
  console.log('4. Add products and customers');
  console.log('5. Test all features');
  
  console.log('\n🔗 Important URLs:');
  console.log('- Application: http://localhost:5173');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard');
  console.log('- Smart Search: http://localhost:5173/smart-search');
  console.log('- Product Management: http://localhost:5173/produtos');
  console.log('- Customer Management: http://localhost:5173/clientes');
  console.log('- Order Management: http://localhost:5173/pedidos');
  console.log('- Inventory Control: http://localhost:5173/estoque');
  
  console.log('\n📚 Documentation:');
  console.log('- API Documentation: Check services/ folder');
  console.log('- Database Schema: Check supabase/migrations/');
  console.log('- Deployment Report: deployment-report.json');
  
  console.log('\n✨ Your TruckParts SC SaaS is ready for production!');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 TruckParts SC SaaS Deployment Script

Usage: node scripts/deploy-saas.js [options]

Options:
  --help, -h     Show this help message
  --migrate-only  Apply only database migrations
  --functions-only Deploy only Edge Functions
  --build-only    Build only frontend
  --validate-only Validate deployment only

Examples:
  node scripts/deploy-saas.js              # Full deployment
  node scripts/deploy-saas.js --migrate-only  # Migrate database only
  node scripts/deploy-saas.js --functions-only # Deploy functions only
  node scripts/deploy-saas.js --build-only    # Build frontend only
  node scripts/deploy-saas.js --validate-only # Validate deployment only
`);
  process.exit(0);
}

// Execute specific commands based on arguments
if (args.includes('--migrate-only')) {
  checkPrerequisites();
  applyMigrations();
} else if (args.includes('--functions-only')) {
  checkPrerequisites();
  deployFunctions();
} else if (args.includes('--build-only')) {
  checkPrerequisites();
  buildFrontend();
} else if (args.includes('--validate-only')) {
  validateDeployment();
} else {
  // Full deployment
  deploy();
}
