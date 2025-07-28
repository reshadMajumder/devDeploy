# DevDeploy Security Service - Java Setup Script
# This script helps you set up the correct Java version for the project

Write-Host "=== DevDeploy Security Service - Java Setup ===" -ForegroundColor Green
Write-Host ""

# Check current Java version
Write-Host "Checking current Java version..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | ForEach-Object { $_.ToString() }
    Write-Host "Current Java version: $javaVersion" -ForegroundColor Cyan
    
    # Extract version number
    if ($javaVersion -match '(\d+)\.(\d+)\.(\d+)') {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 17 -and $majorVersion -le 21) {
            Write-Host "✅ Java version is compatible with Spring Boot 3.4!" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now build and run the project:" -ForegroundColor Green
            Write-Host "  ./gradlew clean build" -ForegroundColor Cyan
            Write-Host "  ./gradlew bootRun" -ForegroundColor Cyan
            exit 0
        } elseif ($majorVersion -eq 24) {
            Write-Host "❌ Java 24 is not compatible with Spring Boot 3.4" -ForegroundColor Red
        } else {
            Write-Host "❌ Java version is not compatible with Spring Boot 3.4" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Java is not installed or not in PATH" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Solutions ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Download and Install Java 21 (Recommended)" -ForegroundColor White
Write-Host "  1. Visit: https://adoptium.net/temurin/releases/?version=21" -ForegroundColor Cyan
Write-Host "  2. Download Windows x64 MSI installer" -ForegroundColor Cyan
Write-Host "  3. Run installer and follow instructions" -ForegroundColor Cyan
Write-Host "  4. Restart PowerShell and run this script again" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 2: Use Chocolatey (if installed)" -ForegroundColor White
Write-Host "  choco install temurin21" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 3: Manual Environment Setup" -ForegroundColor White
Write-Host "  If you have Java 17/21 installed elsewhere:" -ForegroundColor Cyan
Write-Host "  1. Find your Java installation path" -ForegroundColor Cyan
Write-Host "  2. Set JAVA_HOME environment variable" -ForegroundColor Cyan
Write-Host "  3. Add %JAVA_HOME%\bin to PATH" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 4: Configure IDE Project Settings" -ForegroundColor White
Write-Host "  Set your IDE to use Java 17/21 for this specific project" -ForegroundColor Cyan
Write-Host ""

Write-Host "After installing the correct Java version, run:" -ForegroundColor Green
Write-Host "  java -version" -ForegroundColor Cyan
Write-Host "  ./gradlew clean build" -ForegroundColor Cyan
Write-Host "  ./gradlew bootRun" -ForegroundColor Cyan
