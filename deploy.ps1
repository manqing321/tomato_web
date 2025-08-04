# Deployment Script with proper error handling

param(
    [string]$ip = "...",
    [string]$pwd = "...",
    [string]$dist = "tomato_web/dist",
    [string]$target = "/home/admin/workspace/vue/tomato_website/dist"
)

# 定义 PuTTY 工具的路径
$puttyPath = "C:\Program Files\PuTTY"
$plinkPath = Join-Path $puttyPath "plink.exe"
$pscpPath = Join-Path $puttyPath "pscp.exe"

# 检查 PuTTY 工具是否存在
if (-not (Test-Path $plinkPath)) {
    Write-Host "Error: plink not found at $plinkPath" -ForegroundColor Red
    Write-Host "Please check PuTTY installation" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $pscpPath)) {
    Write-Host "Error: pscp not found at $pscpPath" -ForegroundColor Red
    Write-Host "Please check PuTTY installation" -ForegroundColor Yellow
    exit 1
}

# Check if local dist directory exists
if (-not (Test-Path $dist)) {
    Write-Host "Error: Local directory $dist does not exist" -ForegroundColor Red
    exit 1
}

try {
    # Use plink to create remote directory
    Write-Host "Creating remote directory..." -ForegroundColor Yellow
    $createCommand = "& `"$plinkPath`" -ssh -P 22 -l root -pw $pwd $ip ""mkdir -p $target"""
    Write-Host "Executing: $createCommand" -ForegroundColor Gray
    Invoke-Expression $createCommand
    $plinkExitCode = $LASTEXITCODE
    
    if ($plinkExitCode -ne 0) {
        throw "plink command failed with exit code: $plinkExitCode"
    }
    
    # Use pscp to transfer files
    Write-Host "Starting file transfer..." -ForegroundColor Yellow
    $pscpCommand = "& `"$pscpPath`" -r -P 22 -l root -pw $pwd `"$dist/*`" root@$ip`:$target"
    Write-Host "Executing: $pscpCommand" -ForegroundColor Gray
    Invoke-Expression $pscpCommand
    $pscpExitCode = $LASTEXITCODE
    
    if ($pscpExitCode -ne 0) {
        throw "pscp command failed with exit code: $pscpExitCode"
    }
    
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}