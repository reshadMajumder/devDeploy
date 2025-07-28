# Google OAuth2 Setup Script for DevDeploy Security
# Run this script after creating your Google OAuth2 credentials

Write-Host "🔐 Google OAuth2 Setup for DevDeploy Security" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`n📋 Follow these steps to complete OAuth2 setup:" -ForegroundColor Yellow

Write-Host "`n1️⃣ Google Cloud Console Setup:" -ForegroundColor Cyan
Write-Host "   • Go to: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "   • Create/Select project: 'DevDeploy Security'" -ForegroundColor White
Write-Host "   • Enable: Google+ API (or skip - OAuth2 works without it)" -ForegroundColor White
Write-Host "   • Configure OAuth consent screen" -ForegroundColor White
Write-Host "   • Create OAuth 2.0 Client ID (Web application)" -ForegroundColor White

Write-Host "`n2️⃣ Authorized Redirect URIs (Add these in Google Console):" -ForegroundColor Cyan
Write-Host "   • http://localhost:8081/login/oauth2/code/google" -ForegroundColor White
Write-Host "   • http://localhost:8081/oauth2/success" -ForegroundColor White

Write-Host "`n3️⃣ Required Scopes:" -ForegroundColor Cyan
Write-Host "   • ../auth/userinfo.email" -ForegroundColor White
Write-Host "   • ../auth/userinfo.profile" -ForegroundColor White
Write-Host "   • openid" -ForegroundColor White

Write-Host "`n4️⃣ Enter Your Google OAuth2 Credentials:" -ForegroundColor Cyan

# Get Google Client ID
do {
    $clientId = Read-Host "Enter your GOOGLE_CLIENT_ID"
    if ([string]::IsNullOrWhiteSpace($clientId)) {
        Write-Host "❌ Client ID cannot be empty!" -ForegroundColor Red
    }
} while ([string]::IsNullOrWhiteSpace($clientId))

# Get Google Client Secret
do {
    $clientSecret = Read-Host "Enter your GOOGLE_CLIENT_SECRET" -AsSecureString
    $clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret))
    if ([string]::IsNullOrWhiteSpace($clientSecretPlain)) {
        Write-Host "❌ Client Secret cannot be empty!" -ForegroundColor Red
    }
} while ([string]::IsNullOrWhiteSpace($clientSecretPlain))

# Set environment variables
Write-Host "`n🔧 Setting Environment Variables..." -ForegroundColor Yellow

$env:GOOGLE_CLIENT_ID = $clientId
$env:GOOGLE_CLIENT_SECRET = $clientSecretPlain

Write-Host "✅ Environment variables set for current session!" -ForegroundColor Green

# Show masked values
Write-Host "`n📊 Current Values:" -ForegroundColor Yellow
Write-Host "   GOOGLE_CLIENT_ID: $($clientId.Substring(0, [Math]::Min(20, $clientId.Length)))..." -ForegroundColor Green
Write-Host "   GOOGLE_CLIENT_SECRET: $($clientSecretPlain.Substring(0, [Math]::Min(10, $clientSecretPlain.Length)))..." -ForegroundColor Green

# Create .env file for future reference
Write-Host "`n💾 Creating .env file for future reference..." -ForegroundColor Yellow

$envContent = @"
# Google OAuth2 Configuration for DevDeploy Security
# Copy these values to your environment or IDE configuration

GOOGLE_CLIENT_ID=$clientId
GOOGLE_CLIENT_SECRET=$clientSecretPlain

# Additional JWT Configuration (optional - has defaults)
# JWT_SECRET=your-custom-jwt-secret-here
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Created .env file with your credentials" -ForegroundColor Green

# Security reminder
Write-Host "`n🔒 Security Reminders:" -ForegroundColor Red
Write-Host "   • Never commit .env file to version control" -ForegroundColor Yellow
Write-Host "   • Add .env to your .gitignore file" -ForegroundColor Yellow
Write-Host "   • Keep your client secret secure" -ForegroundColor Yellow

# Test configuration
Write-Host "`n🧪 Testing Configuration..." -ForegroundColor Yellow

try {
    # Check if application.yml exists and has correct structure
    $appConfigPath = "src\main\resources\application.yml"
    if (Test-Path $appConfigPath) {
        $config = Get-Content $appConfigPath -Raw
        if ($config -match "GOOGLE_CLIENT_ID" -and $config -match "GOOGLE_CLIENT_SECRET") {
            Write-Host "✅ application.yml is properly configured for OAuth2" -ForegroundColor Green
        } else {
            Write-Host "⚠️  application.yml might need OAuth2 configuration" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  Could not verify application.yml configuration" -ForegroundColor Yellow
}

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start your application: .\gradlew bootRun" -ForegroundColor White
Write-Host "   2. Open browser: http://localhost:8081/oauth2-test.html" -ForegroundColor White
Write-Host "   3. Click 'Sign in with Google' to test" -ForegroundColor White
Write-Host "   4. Run test script: .\test-oauth2.ps1" -ForegroundColor White

Write-Host "`n✨ OAuth2 setup completed!" -ForegroundColor Green

# Prompt to start application
$startApp = Read-Host "`nWould you like to start the application now? (y/n)"
if ($startApp -eq "y" -or $startApp -eq "Y") {
    Write-Host "`n🚀 Starting DevDeploy Security application..." -ForegroundColor Green
    .\gradlew bootRun
}
