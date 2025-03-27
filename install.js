
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure scripts directory exists
const scriptsDir = path.join(__dirname, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Ensure sql-templates directory exists
const sqlTemplatesDir = path.join(__dirname, 'sql-templates');
if (!fs.existsSync(sqlTemplatesDir)) {
  fs.mkdirSync(sqlTemplatesDir, { recursive: true });
}

// Create template directory if it doesn't exist
const templateDir = path.join(__dirname, 'template');
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}

// Make scripts executable
function makeExecutable(scriptPath) {
  try {
    fs.chmodSync(scriptPath, '755');
    console.log(`Made ${path.basename(scriptPath)} executable`);
  } catch (error) {
    console.error(`Failed to make ${path.basename(scriptPath)} executable:`, error);
  }
}

const scripts = [
  path.join(scriptsDir, 'init.js'),
  path.join(scriptsDir, 'create-template.js'),
  path.join(__dirname, 'install.js')
];

scripts.forEach(makeExecutable);

// Create the template first
console.log('Creating initial template...');
try {
  execSync('node scripts/create-template.js', { stdio: 'inherit' });
  console.log('Template created successfully');
} catch (error) {
  console.error('Failed to create template:', error);
}

console.log('\n✅ Installation complete!');
console.log('\nTo create a new SaaS project:');
console.log('  node scripts/init.js');
console.log('\nTo update the template from the current codebase:');
console.log('  node scripts/create-template.js');
