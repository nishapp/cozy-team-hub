
# SaaS Boilerplate

A complete SaaS application boilerplate with Supabase authentication, role-based access control, and a modern React frontend.

## Features

- 🔒 Authentication with Supabase
- 👥 Role-based access control (Admin / User)
- 🏢 Company settings management
- 🎨 Responsive UI with Tailwind CSS and shadcn/ui
- 🌙 Dark/light mode support
- 📱 Mobile-friendly design
- 🔄 Automatic template generation
- 🚀 Quick project setup

## Prerequisites

- Node.js 16+
- npm or yarn
- Supabase CLI (for new Supabase projects)

## Installation

1. Clone this repository
   ```bash
   git clone <repo-url>
   cd saas-boilerplate
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the installation script
   ```bash
   node install.js
   ```

## Creating a New SaaS Project

After installation, you can create a new project:

```bash
node scripts/init.js
```

Follow the prompts to:
1. Enter project name
2. Choose to use an existing or create a new Supabase project
3. Customize your application

The script will set up everything you need to start building your SaaS application.

## Project Structure

- `/src/components`: UI components
- `/src/pages`: Application pages
- `/src/context`: React context providers
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions
- `/src/integrations`: Third-party integrations
- `/template`: Base template for new projects
- `/scripts`: Setup and utility scripts
- `/sql-templates`: SQL migration templates for Supabase

## Development

Once you've created a project, navigate to its directory and run:

```bash
npm run dev
```

Visit `http://localhost:8080` to see your application.

## Updating the Template

To update the template based on your current codebase:

```bash
node scripts/create-template.js
```

This will copy your current project structure to the template directory, excluding non-essential files.

## License

MIT
