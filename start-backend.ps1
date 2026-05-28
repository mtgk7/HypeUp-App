# HypeUp Backend Başlatıcı
# Kullanım: sağ tık → PowerShell ile çalıştır
#           VEYA terminal: .\start-backend.ps1

$ErrorActionPreference = "Stop"
$backendDir = "$PSScriptRoot\backend"
$venvPython = "$backendDir\.venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Venv bulunamadı, oluşturuluyor..." -ForegroundColor Yellow
    Set-Location $backendDir
    py -3.11 -m venv .venv
}

if (-not (Test-Path "$backendDir\.env")) {
    Write-Host "HATA: backend\.env dosyası bulunamadı!" -ForegroundColor Red
    Write-Host "backend\.env.example dosyasını kopyalayıp doldurun." -ForegroundColor Yellow
    exit 1
}

Write-Host "HypeUp Backend baslatiliyor (Python 3.11)..." -ForegroundColor Cyan
Set-Location $backendDir
& $venvPython -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
