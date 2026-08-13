import 'dotenv/config';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  test: {
    globals: true,
    environment: 'node',

    threads: false,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },

    env: {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres825j@localhost:5432/protectora?schema=public"
    },

    setupFiles: ['./src/tests/setup.ts',
      './src/tests/integration/setup.integration.ts' // Integración
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
      ],
    },
  },
});
