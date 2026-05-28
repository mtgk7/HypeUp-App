# HypeUp Frontend Başlatıcı
$frontendDir = "$PSScriptRoot\frontend"

if (-not (Test-Path "$frontendDir\.env.local")) {
    Write-Host "HATA: frontend\.env.local bulunamadı!" -ForegroundColor Red
    Write-Host "frontend\.env.example'ı kopyalayıp doldurun." -ForegroundColor Yellow
    exit 1
}

Write-Host "HypeUp Frontend baslatiliyor..." -ForegroundColor Cyan
Set-Location $frontendDir
npm run dev
