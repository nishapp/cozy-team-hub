
# SaaS Boilerplate Setup Scripts

This directory contains scripts for setting up a new SaaS project based on the boilerplate template.

## Scripts

- `init.js` - Main initialization script
- `setup-supabase.js` - Handles Supabase project setup
- `customize-project.js` - Customizes the project with user-provided configuration

## Usage

To create a new SaaS project:

```bash
# Make sure script is executable
chmod +x ./scripts/init.js

# Run the initialization script
./scripts/init.js
```

The script will guide you through the setup process:

1. Enter project details
2. Set up Supabase (new or existing)
3. Customize the project with your settings
4. Install dependencies

## Requirements

- Node.js 16+
- Supabase CLI (if creating a new Supabase project)
- Git

## Manual Setup

If you prefer to set up the project manually:

1. Copy the template directory to your project location
2. Set up a Supabase project manually
3. Update the Supabase configuration in `src/integrations/supabase/client.ts`
4. Update company defaults in `src/components/layout/Navbar.tsx`
5. Run `npm install` to install dependencies
