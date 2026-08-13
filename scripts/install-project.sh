#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/6] Verificando dependencias de Node.js..."
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js no está instalado. Instálalo antes de continuar." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm no está instalado. Instálalo antes de continuar." >&2
  exit 1
fi

echo "[2/6] Instalando dependencias del proyecto raíz..."
npm install

echo "[3/6] Instalando dependencias del backend..."
npm --prefix backend install

echo "[4/6] Instalando dependencias del frontend..."
npm --prefix frontend install

if [ ! -f .env ]; then
  echo "[5/6] Creando archivo .env a partir de .env.example..."
  cp .env.example .env
else
  echo "[5/6] El archivo .env ya existe; se conserva."
  if ! grep -q '^DATABASE_URL=' .env; then
    echo "[5/6] Añadiendo DATABASE_URL faltante al archivo .env..."
    if grep -q '^DATABASE_URL=' .env.example; then
      grep '^DATABASE_URL=' .env.example | head -n 1 >> .env
    fi
  fi
fi

echo "[6/6] Generando cliente Prisma y aplicando esquema..."
npm run prisma:generate
npm run prisma:push

echo ""
echo "Instalación completada."
echo "Próximos pasos:"
echo "  - Revisar el archivo .env y ajustar los valores si es necesario"
echo "  - Ejecutar: npm run dev:backend"
echo "  - Ejecutar en otra terminal: npm run dev:frontend"
