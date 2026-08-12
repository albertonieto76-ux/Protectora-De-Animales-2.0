import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const isLocalDevAlias = (hostname) => {
    if (hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1') {
        return true;
    }

    return /^(10\.(\d{1,3}\.){2}\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(hostname);
};

if (import.meta.env.DEV && isLocalDevAlias(window.location.hostname)) {
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
