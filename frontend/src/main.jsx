import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

if (import.meta.env.DEV && window.location.hostname === '127.0.0.1') {
    const nextUrl = new URL(window.location.href);
    nextUrl.hostname = 'localhost';
    window.location.replace(nextUrl.toString());
} else {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
