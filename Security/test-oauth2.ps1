# DevDeploy OAuth2 Testing Script
# This script helps you test Google OAuth2 integration

Write-Host "🔐 DevDeploy OAuth2 Testing Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if environment variables are set
Write-Host "`n📋 Checking Environment Variables..." -ForegroundColor Yellow

$googleClientId = $env:GOOGLE_CLIENT_ID
$googleClientSecret = $env:GOOGLE_CLIENT_SECRET

if ([string]::IsNullOrEmpty($googleClientId)) {
    Write-Host "❌ GOOGLE_CLIENT_ID is not set!" -ForegroundColor Red
    Write-Host "   Set it with: `$env:GOOGLE_CLIENT_ID = 'your-google-client-id'" -ForegroundColor Cyan
} else {
    Write-Host "✅ GOOGLE_CLIENT_ID: $($googleClientId.Substring(0, [Math]::Min(20, $googleClientId.Length)))..." -ForegroundColor Green
}

if ([string]::IsNullOrEmpty($googleClientSecret)) {
    Write-Host "❌ GOOGLE_CLIENT_SECRET is not set!" -ForegroundColor Red
    Write-Host "   Set it with: `$env:GOOGLE_CLIENT_SECRET = 'your-google-client-secret'" -ForegroundColor Cyan
} else {
    Write-Host "✅ GOOGLE_CLIENT_SECRET: $($googleClientSecret.Substring(0, [Math]::Min(10, $googleClientSecret.Length)))..." -ForegroundColor Green
}

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "`n🔍 Testing: $Description" -ForegroundColor Yellow
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -Headers $Headers -ErrorAction Stop
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "🔒 Authentication required (401) - Expected for protected endpoints" -ForegroundColor Yellow
        }
        elseif ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "❌ Endpoint not found (404)" -ForegroundColor Red
        }
        else {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Test endpoints
Write-Host "`n🚀 Testing Endpoints..." -ForegroundColor Yellow

$baseUrl = "http://localhost:8081"

# Test public endpoints
Test-Endpoint -Url "$baseUrl/api/v1/auth/health" -Description "Health Check"
Test-Endpoint -Url "$baseUrl/api/v1/oauth2/login/google" -Description "Google Login Info"

# Test OAuth2 endpoints (these will require browser interaction)
Write-Host "`n🌐 OAuth2 Browser Tests:" -ForegroundColor Yellow
Write-Host "   1. Open: $baseUrl/oauth2/authorization/google" -ForegroundColor Cyan
Write-Host "   2. Complete Google sign-in" -ForegroundColor Cyan
Write-Host "   3. Copy JWT token from response" -ForegroundColor Cyan

# Test protected endpoints (requires JWT token)
Write-Host "`n🔒 Protected Endpoints (require JWT token):" -ForegroundColor Yellow
Write-Host "   - GET $baseUrl/api/v1/oauth2/user" -ForegroundColor Cyan
Write-Host "   - GET $baseUrl/api/v1/user/profile" -ForegroundColor Cyan

Test-Endpoint -Url "$baseUrl/api/v1/oauth2/user" -Description "OAuth2 User Info (Protected)"

Write-Host "`n📖 Testing Instructions:" -ForegroundColor Yellow
Write-Host "1. Make sure your Spring Boot app is running on port 8081" -ForegroundColor White
Write-Host "2. Open browser to: $baseUrl/oauth2-test.html" -ForegroundColor White
Write-Host "3. Click 'Sign in with Google' button" -ForegroundColor White
Write-Host "4. Complete OAuth2 flow and note the JWT token" -ForegroundColor White
Write-Host "5. Use the JWT token to test protected endpoints" -ForegroundColor White

Write-Host "`n🔧 Manual cURL Commands:" -ForegroundColor Yellow
Write-Host @"
# Test health endpoint
curl -X GET "$baseUrl/api/v1/auth/health"

# Initiate Google OAuth2 (use browser)
Start-Process "$baseUrl/oauth2/authorization/google"

# Test protected endpoint (replace YOUR_JWT_TOKEN)
curl -X GET "$baseUrl/api/v1/oauth2/user" -H "Authorization: Bearer YOUR_JWT_TOKEN"
"@ -ForegroundColor Gray

# Check if server is running
Write-Host "`n🔍 Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Open test page: $baseUrl/oauth2-test.html" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Server is not running. Start it with: .\gradlew bootRun" -ForegroundColor Red
}

Write-Host "`n✨ Testing script completed!" -ForegroundColor Green
