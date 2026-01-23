import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { mountNetworkInterceptor } from './services/networkInterceptor';

// Initialize the global network interceptor before React mounts
// This ensures that any API calls (even early ones) respect the custom Base URL settings
mountNetworkInterceptor();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);