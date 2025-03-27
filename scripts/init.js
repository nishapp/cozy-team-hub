
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { setupSupabase } = require('./setup-supabase.js');
const { customizeProject } = require('./customize-project.js');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt for user input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

// Main initialization function
async function initializeSaasProject() {
  console.log('\n🚀 Welcome to the SaaS Boilerplate Setup!\n');
  
  try {
    // Step 1: Get project details
    const projectName = await prompt('Enter your project name: ');
    const projectDir = path.resolve(process.cwd(), projectName);
    
    // Check if directory already exists
    if (fs.existsSync(projectDir)) {
      const overwrite = await prompt(`Directory '${projectName}' already exists. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup aborted.');
        rl.close();
        return;
      }
      // Remove existing directory
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
    
    // Step 2: Clone the template
    console.log('\n📂 Creating project directory...');
    fs.mkdirSync(projectDir, { recursive: true });
    
    // Copy template files
    console.log('📄 Copying template files...');
    copyTemplateFiles(path.resolve(__dirname, '../template'), projectDir);
    
    // Step 3: Set up Supabase
    console.log('\n🔧 Setting up Supabase...');
    const useExistingSupabase = await prompt('Use existing Supabase project? (y/n): ');
    
    let supabaseConfig;
    if (useExistingSupabase.toLowerCase() === 'y') {
      const projectUrl = await prompt('Enter your Supabase project URL: ');
      const anonKey = await prompt('Enter your Supabase anon key: ');
      supabaseConfig = { projectUrl, anonKey };
    } else {
      // Create new Supabase project
      supabaseConfig = await setupSupabase();
    }
    
    // Step 4: Customize the project
    console.log('\n🎨 Customizing your project...');
    const companyName = await prompt('Enter default company name: ');
    await customizeProject(projectDir, {
      projectName,
      companyName,
      supabaseConfig
    });
    
    // Step 5: Install dependencies
    console.log('\n📦 Installing dependencies...');
    process.chdir(projectDir);
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\n✅ SaaS Boilerplate setup complete!');
    console.log(`\nTo get started:
  cd ${projectName}
  npm run dev
    `);
  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    rl.close();
  }
}

// Helper function to copy template files recursively
function copyTemplateFiles(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Read all files in source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  // Copy each file/directory
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directories
      copyTemplateFiles(sourcePath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Run the initialization
initializeSaasProject();
