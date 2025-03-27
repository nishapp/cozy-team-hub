
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories and files to exclude from the template
const EXCLUDE_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.env',
  '.env.local',
  '.DS_Store',
  'scripts/create-template.js'
];

// Create template directory
const templateDir = path.resolve(__dirname, '../template');
if (fs.existsSync(templateDir)) {
  fs.rmSync(templateDir, { recursive: true, force: true });
}
fs.mkdirSync(templateDir, { recursive: true });

// Copy files from current project to template directory
function copyProjectToTemplate(sourcePath, targetPath, isRoot = true) {
  // Skip excluded paths
  const relativePath = path.relative(path.resolve(__dirname, '..'), sourcePath);
  if (EXCLUDE_PATHS.some(excludePath => 
    isRoot ? relativePath === excludePath : relativePath.includes(excludePath)
  )) {
    return;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  
  // If source is a directory, copy its contents recursively
  if (fs.statSync(sourcePath).isDirectory()) {
    const entries = fs.readdirSync(sourcePath);
    
    for (const entry of entries) {
      const srcPath = path.join(sourcePath, entry);
      const tgtPath = path.join(targetPath, entry);
      
      copyProjectToTemplate(srcPath, tgtPath, false);
    }
  } else {
    // Copy file
    fs.copyFileSync(sourcePath, targetPath);
  }
}

// Main function
function createTemplate() {
  console.log('Creating SaaS boilerplate template...');
  
  // Source directory (current project)
  const sourceDir = path.resolve(__dirname, '..');
  
  // Copy project files to template directory
  copyProjectToTemplate(sourceDir, templateDir);
  
  // Create SQL templates directory if it doesn't exist
  const sqlTemplateDir = path.resolve(__dirname, '../sql-templates');
  if (!fs.existsSync(sqlTemplateDir)) {
    fs.mkdirSync(sqlTemplateDir, { recursive: true });
    
    // Copy the schema SQL file to sql-templates directory
    const schemaFile = path.resolve(__dirname, '../sql-templates/00_schema.sql');
    if (fs.existsSync(schemaFile)) {
      fs.copyFileSync(
        schemaFile,
        path.join(sqlTemplateDir, '00_schema.sql')
      );
    } else {
      console.warn('Warning: Schema SQL file not found.');
    }
  }
  
  console.log('Template created successfully!');
  console.log('\nTo use this template:');
  console.log('1. Run the init.js script: ./scripts/init.js');
  console.log('2. Follow the prompts to create a new project');
}

createTemplate();
