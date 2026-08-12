import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_BACKEND_TARGET || 'http://localhost:4000';
const devHost = process.env.VITE_DEV_HOST || 'localhost';

export default defineConfig({
    plugins: [react()],
    server: {
        host: devHost,
        port: 5173,
        open: true,
        proxy: {
            '/api': {
                target: backendTarget,
                changeOrigin: true,
                secure: false
            },
            '/uploads': {
                target: backendTarget,
                changeOrigin: true,
                secure: false
            },
            '/seed-assets': {
                target: backendTarget,
                changeOrigin: true,
                secure: false
            }
        }
    }
});

