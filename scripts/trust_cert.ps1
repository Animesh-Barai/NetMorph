# Trust the mitmproxy CA certificate in the Windows system store
# Requires Administrator privileges

$certPath = "$env:USERPROFILE\.mitmproxy\mitmproxy-ca-cert.cer"

if (-not (Test-Path $certPath)) {
    Write-Host "Error: mitmproxy CA certificate not found at $certPath" -ForegroundColor Red
    Write-Host "Please run 'uv run mitmdump' at least once to generate the certificates." -ForegroundColor Yellow
    exit 1
}

Write-Host "Importing mitmproxy CA certificate to Trusted Root Certification Authorities..." -ForegroundColor Cyan
Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\LocalMachine\Root

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully trusted mitmproxy CA certificate." -ForegroundColor Green
} else {
    Write-Host "Failed to import certificate. Ensure you are running this script as Administrator." -ForegroundColor Red
}
