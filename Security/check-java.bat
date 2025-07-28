@echo off
echo === DevDeploy Security Service - Java Version Check ===
echo.

echo Checking current Java version...
java -version
echo.

echo === Required: Java 17 or 21 ===
echo Current: Java 24 (Not Compatible)
echo.
echo Solutions:
echo 1. Download Java 21 from: https://adoptium.net/temurin/releases/?version=21
echo 2. Install and restart your terminal
echo 3. Run: java -version to verify
echo 4. Then run: gradlew clean build
echo.
pause
