
const fs = require('fs');
const path = require('path');

/**
 * Customizes the project with user-provided configuration
 * @param {string} projectDir - The project directory
 * @param {Object} config - Configuration object
 * @param {string} config.projectName - Project name
 * @param {string} config.companyName - Default company name
 * @param {Object} config.supabaseConfig - Supabase configuration
 * @param {string} config.supabaseConfig.projectUrl - Supabase project URL
 * @param {string} config.supabaseConfig.anonKey - Supabase anon key
 */
async function customizeProject(projectDir, config) {
  // Update package.json
  updatePackageJson(projectDir, config);
  
  // Update Supabase client
  updateSupabaseClient(projectDir, config);
  
  // Update company defaults
  updateCompanyDefaults(projectDir, config);
  
  // Update index.html metadata
  updateIndexHtml(projectDir, config);
  
  // Update readme
  updateReadme(projectDir, config);
}

/**
 * Updates the package.json file
 */
function updatePackageJson(projectDir, { projectName }) {
  const pkgPath = path.join(projectDir, 'package.json');
  
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    pkg.name = projectName.toLowerCase().replace(/\s+/g, '-');
    pkg.version = '0.1.0';
    
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('✅ Updated package.json');
  }
}

/**
 * Updates the Supabase client configuration
 */
function updateSupabaseClient(projectDir, { supabaseConfig }) {
  const clientPath = path.join(projectDir, 'src/integrations/supabase/client.ts');
  
  if (fs.existsSync(clientPath)) {
    let content = fs.readFileSync(clientPath, 'utf8');
    
    // Replace Supabase URL and anon key
    content = content.replace(
      /const SUPABASE_URL = ".*"/,
      `const SUPABASE_URL = "${supabaseConfig.projectUrl}"`
    );
    
    content = content.replace(
      /const SUPABASE_PUBLISHABLE_KEY = ".*"/,
      `const SUPABASE_PUBLISHABLE_KEY = "${supabaseConfig.anonKey}"`
    );
    
    fs.writeFileSync(clientPath, content);
    console.log('✅ Updated Supabase client configuration');
  }
}

/**
 * Updates the company defaults
 */
function updateCompanyDefaults(projectDir, { companyName }) {
  const navbarPath = path.join(projectDir, 'src/components/layout/Navbar.tsx');
  
  if (fs.existsSync(navbarPath)) {
    let content = fs.readFileSync(navbarPath, 'utf8');
    
    // Find and update default company name
    content = content.replace(
      /name: "WDYLT"/,
      `name: "${companyName}"`
    );
    
    fs.writeFileSync(navbarPath, content);
    console.log('✅ Updated default company name');
  }
}

/**
 * Updates the index.html metadata
 */
function updateIndexHtml(projectDir, { projectName }) {
  const indexPath = path.join(projectDir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Update title and meta tags
    content = content.replace(
      /<title>.*<\/title>/,
      `<title>${projectName}</title>`
    );
    
    content = content.replace(
      /<meta name="description" content=".*" \/>/,
      `<meta name="description" content="${projectName} - SaaS Application" />`
    );
    
    content = content.replace(
      /<meta property="og:title" content=".*" \/>/,
      `<meta property="og:title" content="${projectName}" />`
    );
    
    content = content.replace(
      /<meta property="og:description" content=".*" \/>/,
      `<meta property="og:description" content="${projectName} - SaaS Application" />`
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ Updated HTML metadata');
  }
}

/**
 * Updates the README file
 */
function updateReadme(projectDir, { projectName }) {
  const readmePath = path.join(projectDir, 'README.md');
  
  const readmeContent = `# ${projectName}

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

## Features

- User authentication with Supabase
- Role-based access control
- Company settings management
- Responsive UI with Tailwind CSS and shadcn/ui
- Dark/light mode support

## Project Structure

- \`/src/components\`: UI components
- \`/src/pages\`: Application pages
- \`/src/context\`: React context providers
- \`/src/hooks\`: Custom React hooks
- \`/src/lib\`: Utility functions
- \`/src/integrations\`: Third-party integrations

## Deployment

Deploy your application using your preferred hosting service.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ Created README.md');
}

module.exports = {
  customizeProject
};
