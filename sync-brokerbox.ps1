# sync-brokerbox.ps1
Write-Host "--- Synchronizing BrokerBox Workspace ---" -ForegroundColor Cyan
git pull origin main
pnpm install
Write-Host "--- Workspace Synchronized ---" -ForegroundColor Green
