
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById('root');

// Create root and render app
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <App />
  );
} else {
  console.error('Root element not found');
}
