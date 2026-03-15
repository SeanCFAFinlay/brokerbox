# deploy-brokerbox.ps1
Write-Host "--- Starting BrokerBox Production Deployment ---" -ForegroundColor Cyan
pnpm install
pnpm run build
vercel deploy --prod
Write-Host "--- Deployment Complete ---" -ForegroundColor Green
