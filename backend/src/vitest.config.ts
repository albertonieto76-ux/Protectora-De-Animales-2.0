import 'dotenv/config';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
      DATABASE_URL: "postgresql://postgres:postgres825j@127.0.0.1:5432/AdoptaBBDD_db?schema=public"
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
