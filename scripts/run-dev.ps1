$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Iniciando backend y frontend..."

$backend = Start-Process -FilePath "npm" -ArgumentList "--prefix", "backend", "run", "dev" -PassThru -NoNewWindow
$frontend = Start-Process -FilePath "npm" -ArgumentList "--prefix", "frontend", "run", "dev" -PassThru -NoNewWindow

Write-Host "Backend PID: $($backend.Id)"
Write-Host "Frontend PID: $($frontend.Id)"
Write-Host "Pulsa Ctrl+C en la ventana para detener ambos procesos."
