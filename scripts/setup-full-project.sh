#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/8] Verificando dependencias de Node.js..."
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js no está instalado. Instálalo antes de continuar." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm no está instalado. Instálalo antes de continuar." >&2
  exit 1
fi

echo "[2/8] Instalando dependencias del proyecto raíz..."
npm install

echo "[3/8] Instalando dependencias del backend..."
npm --prefix backend install

echo "[4/8] Instalando dependencias del frontend..."
npm --prefix frontend install

if [ ! -f .env ]; then
  echo "[5/8] Creando archivo .env a partir de .env.example..."
  cp .env.example .env
else
  echo "[5/8] El archivo .env ya existe; se conserva."
fi

echo "[6/8] Generando cliente Prisma..."
npm run prisma:generate

echo "[7/8] Aplicando esquema de base de datos..."
npm run prisma:push

echo "[8/8] Creando administrador inicial..."
npm --prefix backend exec tsx scripts/seedAdmin.ts

echo ""
echo "Configuración completa."
echo "Próximos pasos:"
echo "  - Revisar .env si necesitas ajustar la base de datos o secretos"
echo "  - Ejecutar datos de prueba opcionales: npm --prefix backend exec tsx scripts/seedLoadTestData.ts"
echo "  - Ejecutar backend: npm run dev:backend"
echo "  - Ejecutar frontend: npm run dev:frontend"
