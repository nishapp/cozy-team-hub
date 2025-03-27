
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt for user input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

/**
 * Sets up a new Supabase project
 * @returns {Promise<{projectUrl: string, anonKey: string}>}
 */
async function setupSupabase() {
  console.log('Setting up a new Supabase project...');
  
  // Check if Supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('Supabase CLI not found. Please install it first:');
    console.log('npm install -g supabase');
    throw new Error('Supabase CLI required');
  }
  
  // Get Supabase login status
  try {
    execSync('supabase projects list', { stdio: 'ignore' });
  } catch (error) {
    console.log('Please login to Supabase CLI first:');
    execSync('supabase login', { stdio: 'inherit' });
  }
  
  // Create a new Supabase project
  const projectName = await prompt('Enter Supabase project name: ');
  const organizationId = await prompt('Enter your Supabase organization ID: ');
  const region = await prompt('Enter Supabase region (default: us-east-1): ') || 'us-east-1';
  
  console.log('Creating Supabase project...');
  const createOutput = execSync(`supabase projects create "${projectName}" --org-id "${organizationId}" --region "${region}"`, { encoding: 'utf8' });
  
  // Extract project ID from the output
  const projectIdMatch = createOutput.match(/Project ID: ([a-zA-Z0-9]+)/);
  if (!projectIdMatch) {
    throw new Error('Could not extract project ID from Supabase output');
  }
  
  const projectId = projectIdMatch[1];
  console.log(`Supabase project created with ID: ${projectId}`);
  
  // Get project URL and anon key
  const projectDetails = JSON.parse(execSync(`supabase projects show ${projectId} --db-url --json`, { encoding: 'utf8' }));
  
  // Initialize Supabase locally (for reference schema)
  console.log('Initializing Supabase schema...');
  fs.mkdirSync('./supabase', { recursive: true });
  execSync('supabase init', { stdio: 'inherit' });
  
  // Apply SQL migrations
  console.log('Applying SQL migrations...');
  const sqlTemplateDir = path.resolve(__dirname, '../sql-templates');
  if (fs.existsSync(sqlTemplateDir)) {
    const sqlFiles = fs.readdirSync(sqlTemplateDir).filter(file => file.endsWith('.sql'));
    
    for (const sqlFile of sqlFiles) {
      const sqlContent = fs.readFileSync(path.join(sqlTemplateDir, sqlFile), 'utf8');
      console.log(`Applying migration: ${sqlFile}`);
      
      // Create a temporary file to execute
      const tempFile = path.join('./supabase/migrations', `${Date.now()}_${sqlFile}`);
      fs.writeFileSync(tempFile, sqlContent);
      
      // Apply the migration
      execSync(`supabase db push --project-id ${projectId}`, { stdio: 'inherit' });
    }
  }
  
  return {
    projectUrl: `https://${projectId}.supabase.co`,
    anonKey: projectDetails.anon_key
  };
}

module.exports = {
  setupSupabase
};
