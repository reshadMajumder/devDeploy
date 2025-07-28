# Test DevDeploy Security Endpoints
Write-Host "🧪 Testing DevDeploy Security Endpoints" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$baseUrl = "http://localhost:8081"

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "`n🔍 Testing: $Description" -ForegroundColor Yellow
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ Success! Status: $($response.StatusCode)" -ForegroundColor Green
        if ($response.Content) {
            Write-Host "   Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Gray
        }
        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "🔒 Authentication required (401) - Expected for protected endpoints" -ForegroundColor Yellow
            return $true
        }
        elseif ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "❌ Endpoint not found (404)" -ForegroundColor Red
            return $false
        }
        else {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Test various endpoints
Write-Host "`n🚀 Testing Endpoints..." -ForegroundColor Cyan

$tests = @(
    @{ Url = "$baseUrl/api/v1/auth/health"; Description = "Health Check" },
    @{ Url = "$baseUrl/oauth2-test.html"; Description = "OAuth2 Test Page" },
    @{ Url = "$baseUrl/api/v1/oauth2/login/google"; Description = "Google Login Info" },
    @{ Url = "$baseUrl/oauth2/authorization/google"; Description = "OAuth2 Authorization" },
    @{ Url = "$baseUrl/h2-console"; Description = "H2 Database Console" }
)

$successCount = 0
foreach ($test in $tests) {
    if (Test-Endpoint -Url $test.Url -Description $test.Description) {
        $successCount++
    }
}

Write-Host "`n📊 Results: $successCount/$($tests.Count) endpoints are working" -ForegroundColor Cyan

if ($successCount -gt 0) {
    Write-Host "`n🎉 Application is running! You can now:" -ForegroundColor Green
    Write-Host "   • Open browser: $baseUrl/oauth2-test.html" -ForegroundColor White
    Write-Host "   • Test OAuth2: $baseUrl/oauth2/authorization/google" -ForegroundColor White
    Write-Host "   • Check database: $baseUrl/h2-console" -ForegroundColor White
} else {
    Write-Host "`n❌ Application doesn't seem to be responding. Check if it's running." -ForegroundColor Red
}

Write-Host "`n✨ Test completed!" -ForegroundColor Green
