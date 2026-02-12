#!/usr/bin/env node

/**
 * Setup Verification Script for Todi Viewer v14
 * 
 * This script checks if your local environment is properly configured
 * to run the v14 viewer with ES6 modules.
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Todi Viewer v14 - Setup Verification                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let hasErrors = false;

// Check 1: Verify js/ directory exists
console.log('📁 Checking for js/ directory...');
if (fs.existsSync('js') && fs.statSync('js').isDirectory()) {
  console.log('   ✅ js/ directory found\n');
} else {
  console.log('   ❌ js/ directory NOT found!');
  console.log('   This is required for v14 modules.\n');
  hasErrors = true;
}

// Check 2: Verify required module files
const requiredModules = [
  'js/viewer-state.js',
  'js/labelfx-core.js',
  'js/labelfx-builder.js',
  'js/map-integration.js'
];

console.log('📄 Checking for required JavaScript modules...');
requiredModules.forEach(modulePath => {
  if (fs.existsSync(modulePath)) {
    const stats = fs.statSync(modulePath);
    console.log(`   ✅ ${modulePath} (${(stats.size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`   ❌ ${modulePath} NOT found!`);
    hasErrors = true;
  }
});
console.log('');

// Check 3: Verify node_modules
console.log('📦 Checking for dependencies...');
if (fs.existsSync('node_modules')) {
  if (fs.existsSync('node_modules/three')) {
    console.log('   ✅ node_modules/ with Three.js installed\n');
  } else {
    console.log('   ⚠️  node_modules/ exists but Three.js not found');
    console.log('   Run: npm install\n');
    hasErrors = true;
  }
} else {
  console.log('   ❌ node_modules/ NOT found!');
  console.log('   Run: npm install\n');
  hasErrors = true;
}

// Check 4: Verify HTML files
console.log('🌐 Checking for viewer HTML files...');
const htmlFiles = [
  'index_v14_REFACTORED.html',
  'index_FULL_FIXED_v13.html'
];

htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ⚠️  ${file} not found`);
  }
});
console.log('');

// Check 5: Verify package.json
console.log('⚙️  Checking configuration files...');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`   ✅ package.json (v${pkg.version})`);
} else {
  console.log('   ❌ package.json NOT found!');
  hasErrors = true;
}

if (fs.existsSync('serve.py')) {
  console.log('   ✅ serve.py (Python server script)');
} else {
  console.log('   ⚠️  serve.py not found');
}
console.log('');

// Final results
console.log('═══════════════════════════════════════════════════════════');
if (hasErrors) {
  console.log('❌ SETUP INCOMPLETE - Errors detected!\n');
  console.log('🔧 To fix missing files, try:');
  console.log('   1. Ensure you are on the correct branch:');
  console.log('      git checkout copilot/refactor-state-management-3d-map');
  console.log('   2. Pull the latest changes:');
  console.log('      git pull origin copilot/refactor-state-management-3d-map');
  console.log('   3. Install dependencies:');
  console.log('      npm install\n');
  console.log('📖 For more help, see README.md\n');
  process.exit(1);
} else {
  console.log('✅ SETUP COMPLETE - All required files found!\n');
  console.log('🚀 You can now start the server:');
  console.log('   python3 serve.py');
  console.log('   or: npm run serve');
  console.log('   or: npx http-server -p 8000\n');
  console.log('🌐 Then open: http://127.0.0.1:8000/index_v14_REFACTORED.html\n');
  process.exit(0);
}
