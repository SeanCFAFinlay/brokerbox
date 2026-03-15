# setup-env.ps1
# Environment Hardening Script for BrokerBox

$requiredVars = @("DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL")
$missingVars = @()

foreach ($var in $requiredVars) {
    $val = Get-Item -Path "env:$var" -ErrorAction SilentlyContinue
    if (-not $val -and -not (Get-Content .env.local -ErrorAction SilentlyContinue | Select-String "^$var=")) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "CRITICAL ERROR: Missing required environment variables:" -ForegroundColor Red
    foreach ($v in $missingVars) {
        Write-Host "  - $v" -ForegroundColor Yellow
    }
    Write-Host "`nPlease ensure these are set in your terminal or .env.local file." -ForegroundColor White
    exit 1
}

Write-Host "Environment validation successful. All required variables are present." -ForegroundColor Green
exit 0
