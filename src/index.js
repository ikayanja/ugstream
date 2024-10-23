import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Create a root for the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component within StrictMode
root.render(
   <React.StrictMode>
      <App />
   </React.StrictMode>
);

// Register or unregister the service worker
// Use .register() to enable PWA features, or .unregister() to disable them
serviceWorkerRegistration.unregister();
// If you want to enable PWA features, change the above line to:
// serviceWorkerRegistration.register();