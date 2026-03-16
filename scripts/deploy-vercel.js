// Vercel Deployment Script for TruckParts SC
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TruckParts SC - Vercel Deployment Setup\n');

function checkPrerequisites() {
  console.log('1. Checking Prerequisites...');
  
  const requiredFiles = [
    'package.json',
    'vercel.json',
    'src/lib/supabase.ts'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, '..', file)));
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing required files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    return false;
  }
  
  console.log('✅ All required files present');
  return true;
}

function checkEnvironment() {
  console.log('\n2. Checking Environment...');
  
  const envLocalPath = path.join(__dirname, '../.env.local');
  
  if (!fs.existsSync(envLocalPath)) {
    console.log('❌ .env.local not found');
    console.log('Please create .env.local with your Supabase credentials');
    return false;
  }
  
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('❌ Supabase environment variables missing');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  return true;
}

function checkBuild() {
  console.log('\n3. Testing Build Process...');
  
  try {
    console.log('Running: npm run build');
    execSync('npm run build', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
    console.log('✅ Build successful');
    return true;
  } catch (error) {
    console.log('❌ Build failed:');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

function generateVercelConfig() {
  console.log('\n4. Optimizing Vercel Configuration...');
  
  const vercelConfigPath = path.join(__dirname, '../vercel.json');
  let config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  // Add Supabase edge functions support
  config.functions = config.functions || {};
  config.functions['supabase/functions/**/*.ts'] = {
    "runtime": "edge",
    "maxDuration": 30
  };
  
  // Add caching headers for static assets
  config.headers = config.headers || [];
  config.headers.push({
    "source": "/assets/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  });
  
  fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
  console.log('✅ Vercel configuration optimized');
  return true;
}

function createDeploymentInstructions() {
  console.log('\n5. Creating Deployment Instructions...');
  
  const instructions = `
# TruckParts SC - Vercel Deployment Guide

## Prerequisites
1. Vercel account: https://vercel.com
2. Supabase project: https://supabase.com
3. Git repository with your code

## Setup Steps

### 1. Install Vercel CLI
\`\`\`bash
npm i -g vercel
\`\`\`

### 2. Configure Environment Variables in Vercel
Go to your Vercel project dashboard and add these Environment Variables:
- \`VITE_SUPABASE_URL\`: Your Supabase project URL
- \`VITE_SUPABASE_ANON_KEY\`: Your Supabase anonymous key

### 3. Deploy to Vercel
\`\`\`bash
vercel --prod
\`\`\`

### 4. Configure Supabase CORS
In your Supabase project:
1. Go to Settings → API
2. Add your Vercel domain to "Additional Redirect URLs"
3. Enable "Confirm email" if using authentication

### 5. Deploy Edge Functions (Optional)
\`\`\`bash
supabase functions deploy --project-ref your-project-ref
\`\`\`

## Post-Deployment Checklist
- [ ] Test authentication flow
- [ ] Test database connections
- [ ] Test edge functions
- [ ] Verify CORS settings
- [ ] Check performance with Lighthouse

## Troubleshooting

### Common Issues:
1. **CORS errors**: Add your Vercel domain to Supabase redirect URLs
2. **Environment variables**: Ensure they're set in Vercel dashboard
3. **Build failures**: Check that all dependencies are installed
4. **Edge functions**: Verify Supabase CLI is configured correctly

### Support:
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
`;
  
  fs.writeFileSync(path.join(__dirname, '../DEPLOYMENT.md'), instructions);
  console.log('✅ Deployment guide created');
  return true;
}

function main() {
  console.log('🔍 Preparing for Vercel deployment...\n');
  
  const checks = [
    checkPrerequisites(),
    checkEnvironment(),
    checkBuild(),
    generateVercelConfig(),
    createDeploymentInstructions()
  ];
  
  const allPassed = checks.every(Boolean);
  
  if (allPassed) {
    console.log('\n🎉 READY FOR DEPLOYMENT!');
    console.log('\nNext steps:');
    console.log('1. Run: vercel login');
    console.log('2. Run: vercel --prod');
    console.log('3. Configure environment variables in Vercel dashboard');
    console.log('4. Test your deployed application');
    console.log('\n📖 See DEPLOYMENT.md for detailed instructions');
  } else {
    console.log('\n❌ DEPLOYMENT NOT READY');
    console.log('Please fix the issues above before deploying.');
  }
}

main().catch(console.error);
