$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "[1/6] Verificando dependencias de Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js no está instalado. Instálalo antes de continuar."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm no está instalado. Instálalo antes de continuar."
}

Write-Host "[2/6] Instalando dependencias del proyecto raíz..."
npm install

Write-Host "[3/6] Instalando dependencias del backend..."
npm --prefix backend install

Write-Host "[4/6] Instalando dependencias del frontend..."
npm --prefix frontend install

if (-not (Test-Path .env)) {
  Write-Host "[5/6] Creando archivo .env a partir de .env.example..."
  Copy-Item .env.example .env
} else {
  Write-Host "[5/6] El archivo .env ya existe; se conserva."
}

Write-Host "[6/6] Generando cliente Prisma y aplicando esquema..."
npm run prisma:generate
npm run prisma:push

Write-Host ""
Write-Host "Instalación completada."
Write-Host "Próximos pasos:"
Write-Host "  - Revisar el archivo .env y ajustar los valores si es necesario"
Write-Host "  - Ejecutar: npm run dev:backend"
Write-Host "  - Ejecutar en otra terminal: npm run dev:frontend"
