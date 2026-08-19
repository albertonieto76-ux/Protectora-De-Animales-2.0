import 'dotenv/config';
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.ts';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    'TEST_DATABASE_URL es obligatoria para ejecutar los tests E2E. Usa una base de datos exclusiva de pruebas.'
  );
}

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      env: {
        DATABASE_URL: testDatabaseUrl,
      },
    },
  })
);
