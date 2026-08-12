import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PrismaConfig = {
  schema: string;
  datasource: {
    url: string;
  };
};

type DefineConfig = (config: PrismaConfig) => PrismaConfig;

const resolveDefineConfig = async (): Promise<DefineConfig> => {
  try {
    const mod = await import('@prisma/config');
    if (typeof mod.defineConfig === 'function') {
      return mod.defineConfig as DefineConfig;
    }
  } catch {
    // Fallback for environments where @prisma/config is not installed at repo root.
  }

  return (config: PrismaConfig) => config;
};

const loadEnvIfAvailable = async (paths: string[]): Promise<void> => {
  try {
    const dotenvModule = await import('dotenv');
    for (const envPath of paths) {
      dotenvModule.config({ path: envPath });
    }
  } catch {
    // Ignore when dotenv is not available in repo root.
  }
};

await loadEnvIfAvailable([
  path.resolve(__dirname, 'backend', '.env'),
  path.resolve(__dirname, '.env'),
]);

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/protectora?schema=public";

const defineConfig = await resolveDefineConfig();

export default defineConfig({
  schema: './backend/prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
});
