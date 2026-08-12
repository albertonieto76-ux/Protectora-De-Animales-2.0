$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "[1/8] Verificando dependencias de Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js no está instalado. Instálalo antes de continuar."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm no está instalado. Instálalo antes de continuar."
}

Write-Host "[2/8] Instalando dependencias del proyecto raíz..."
npm install

Write-Host "[3/8] Instalando dependencias del backend..."
npm --prefix backend install

Write-Host "[4/8] Instalando dependencias del frontend..."
npm --prefix frontend install

if (-not (Test-Path .env)) {
  Write-Host "[5/8] Creando archivo .env a partir de .env.example..."
  Copy-Item .env.example .env
} else {
  Write-Host "[5/8] El archivo .env ya existe; se conserva."
}

Write-Host "[6/8] Generando cliente Prisma..."
npm run prisma:generate

Write-Host "[7/8] Aplicando esquema de base de datos..."
npm run prisma:push

Write-Host "[8/8] Creando administrador inicial..."
npm --prefix backend exec tsx scripts/seedAdmin.ts

Write-Host ""
Write-Host "Configuración completa."
Write-Host "Próximos pasos:"
Write-Host "  - Revisar .env si necesitas ajustar la base de datos o secretos"
Write-Host "  - Ejecutar datos de prueba opcionales: npm --prefix backend exec tsx scripts/seedLoadTestData.ts"
Write-Host "  - Ejecutar backend: npm run dev:backend"
Write-Host "  - Ejecutar frontend: npm run dev:frontend"
