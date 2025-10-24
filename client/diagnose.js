#!/usr/bin/env node

/**
 * Diagnostic script for IdeaHub Client
 * Checks for common issues that might cause build failures
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 IdeaHub Client Diagnostic Tool');
console.log('==================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Not in a Node.js project directory (no package.json found)');
    process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`📦 Project: ${packageJson.name} v${packageJson.version}`);

// Check critical files
const criticalFiles = [
    'src/utils/api.ts',
    'src/components/layout/Header.tsx',
    'src/components/layout/Footer.tsx',
    'src/pages/NewLandingPage.tsx',
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'tailwind.config.js',
    'vite.config.ts',
    'tsconfig.json'
];

console.log('\n🔍 Checking critical files:');
let missingFiles = [];

for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        missingFiles.push(file);
    }
}

// Check dependencies
console.log('\n📦 Checking key dependencies:');
const keyDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'axios',
    'tailwindcss',
    'framer-motion',
    'lucide-react',
    '@clerk/clerk-react'
];

for (const dep of keyDeps) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]} (dev)`);
    } else {
        console.log(`❌ ${dep} - NOT FOUND`);
    }
}

// Check for common import issues
console.log('\n🔍 Checking for common import issues:');

// Check api.ts exports
if (fs.existsSync('src/utils/api.ts')) {
    const apiContent = fs.readFileSync('src/utils/api.ts', 'utf8');
    if (apiContent.includes('export const api')) {
        console.log('✅ api.ts exports "api" object');
    } else {
        console.log('❌ api.ts missing "api" export');
    }
    
    if (apiContent.includes('export const useApi')) {
        console.log('✅ api.ts exports "useApi" hook');
    } else {
        console.log('❌ api.ts missing "useApi" export');
    }
}

// Check environment variables
console.log('\n🔍 Checking environment setup:');
if (fs.existsSync('.env')) {
    console.log('✅ .env file exists');
    const envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('VITE_API_URL')) {
        console.log('✅ VITE_API_URL is set');
    } else {
        console.log('⚠️  VITE_API_URL not found in .env');
    }
} else {
    console.log('⚠️  .env file not found');
}

// Check node_modules
console.log('\n🔍 Checking installation:');
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules directory exists');
    
    // Check if key packages are installed
    const reactPath = 'node_modules/react/package.json';
    if (fs.existsSync(reactPath)) {
        const reactPkg = JSON.parse(fs.readFileSync(reactPath, 'utf8'));
        console.log(`✅ React ${reactPkg.version} installed`);
    } else {
        console.log('❌ React not properly installed');
    }
} else {
    console.log('❌ node_modules directory missing - run "npm install"');
}

// Summary
console.log('\n📋 Summary:');
if (missingFiles.length > 0) {
    console.log(`❌ ${missingFiles.length} critical files are missing`);
    console.log('Missing files:', missingFiles.join(', '));
} else {
    console.log('✅ All critical files are present');
}

console.log('\n💡 Recommendations:');
if (missingFiles.length > 0) {
    console.log('1. Restore missing files from backup or recreate them');
}
if (!fs.existsSync('node_modules')) {
    console.log('2. Run "npm install" to install dependencies');
}
if (!fs.existsSync('.env')) {
    console.log('3. Create .env file from .env.example');
}
console.log('4. Try running "./restart-dev.sh" to restart the development server');
console.log('5. If issues persist, try "./restart-dev.sh --fresh" for a clean install');

console.log('\n🚀 Ready to start development!');