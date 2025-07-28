# DevDeploy Security Service

A modern Spring Boot 3.4 authentication and authorization microservice for the DevDeploy platform.

## 🔧 Prerequisites

### Java Version Issue Fix

**Current Issue:** You have Java 24 installed, but Spring Boot 3.4 requires Java 17 or 21.

**Solutions:**

### Option 1: Install Java 21 (Recommended)
```bash
# Download and install Java 21 from:
# https://adoptium.net/temurin/releases/?version=21

# After installation, set JAVA_HOME environment variable
# Windows:
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.x.x.x-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

# Verify installation
java -version
```

### Option 2: Use Java Version Manager
```bash
# Install SDKMAN (Windows: use Git Bash or WSL)
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 21
sdk install java 21.0.1-tem
sdk use java 21.0.1-tem
```

### Option 3: Configure IDE to use Java 17/21
If you're using IntelliJ IDEA or Eclipse, configure your project to use Java 17 or 21 specifically for this project.

## 🚀 Quick Start

Once you have Java 17 or 21 installed:

```bash
# Navigate to Security directory
cd Security

# Build the project
./gradlew clean build

# Run the application
./gradlew bootRun
```

The application will start on `http://localhost:8081`

## 📋 API Endpoints

### Authentication Endpoints (Public)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/authenticate` - User login
- `GET /api/v1/auth/health` - Health check

### OAuth2 Endpoints
- `GET /oauth2/authorization/google` - Google OAuth2 login
- `GET /api/v1/oauth2/login/google` - Google login info
- `GET /api/v1/oauth2/user` - Get OAuth2 user info (protected)

### User Endpoints (Protected)
- `GET /api/v1/user/profile` - Get user profile
- `GET /api/v1/user/dashboard` - User dashboard

### Development Endpoints
- `GET /h2-console` - H2 Database console (dev only)
- `GET /actuator/health` - Spring Boot health endpoint
- `GET /oauth2-test.html` - OAuth2 testing interface

## 🔒 Security Features

- **JWT Authentication** - Stateless token-based authentication
- **BCrypt Password Encoding** - Secure password hashing
- **CORS Configuration** - Frontend integration support
- **Role-based Authorization** - USER and ADMIN roles
- **Google OAuth2 Integration** - Complete OAuth2 setup with Google

## 🗄️ Database

- **Development:** H2 in-memory database
- **Console:** Available at `/h2-console` (dev mode)
- **Credentials:** Username: `sa`, Password: (empty)

## ⚙️ Configuration

Key configuration in `src/main/resources/application.yml`:

```yaml
server:
  port: 8081

spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - openid
              - profile
              - email

devdeploy:
  jwt:
    secret: ${JWT_SECRET}
    expiration: 86400000 # 24 hours
  cors:
    allowed-origins:
      - http://localhost:3000  # React dev server
      - http://localhost:5173  # Vite dev server
```

## 🔧 Environment Variables

For production, set these environment variables:
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret

## 🧪 Testing API

### Register a new user:
```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8081/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Access protected endpoint:
```bash
curl -X GET http://localhost:8081/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test OAuth2:
- Open browser: `http://localhost:8081/oauth2-test.html`
- Or run: `./test-oauth2.ps1`

## 📁 Project Structure

```
src/main/java/com/devdeploy/security/
├── config/              # Security and application configuration
├── controller/          # REST controllers
├── dto/                # Data Transfer Objects
├── entity/             # JPA entities
├── filter/             # Security filters
├── repository/         # Data repositories
├── service/            # Business logic services
└── DevDeploySecurityApplication.java
```

## 🔄 Integration with Other Services

This service integrates with:
- **Frontend (React)** - Provides authentication tokens
- **Core (Django)** - Validates JWT tokens for API access
- **Database** - Stores user authentication data

## 🐛 Troubleshooting

### Java Version Issues
- Ensure Java 17 or 21 is installed and set as JAVA_HOME
- Verify with `java -version` and `javac -version`

### Build Issues
- Clean build: `./gradlew clean build`
- Skip tests: `./gradlew build -x test`

### Port Conflicts
- Change port in `application.yml` if 8081 is in use
- Check for other running Spring Boot applications

## 🚀 Production Deployment

1. Build the application: `./gradlew build`
2. The JAR file will be in `build/libs/`
3. Run with: `java -jar build/libs/devdeploy-security-service-0.0.1-SNAPSHOT.jar`
4. Configure environment variables for production database and secrets

---
# 🚀 DevDeploy

**DevDeploy** is a next-gen, developer-centric deployment platform built for freelancers, beginners, and startups who want a powerful, affordable alternative to Vercel or Render. Deploy your full-stack projects to your own VPS with just a few clicks—no DevOps expertise required.

---

## 🌟 Why DevDeploy?
- **No Recurring Fees:** Pay a one-time, ultra-low service fee per VPS (e.g., ৳200)
- **Bring Your Own VPS:** Full control, zero vendor lock-in
- **Modern CI/CD:** Automated builds & deployments from GitHub
- **Real-Time Logs:** See exactly what’s happening, as it happens
- **Secure by Design:** SSH credentials are encrypted and never shared
- **Made for You:** Especially affordable for developers in regions like Bangladesh

---

## 🧩 Microservices Architecture
DevDeploy is built as a set of modern microservices:
- **Authentication Service:** User login & registration powered by Spring Boot
- **API Backend:** Core deployment logic with Django REST Framework (DRF)
- **Frontend:** Lightning-fast React app (Vite + Tailwind CSS)

---

## 🚦 Key Features
- **Sign Up & Login** (Spring Boot Auth Service)
- **Connect GitHub**
- **Add Your VPS (SSH)**
- **Deploy Dockerized Projects**
- **Automated CI/CD**
- **Real-Time Status & Logs**

---

## 🎯 Goals & Vision
- Make deployment as easy as pushing to GitHub
- Remove DevOps complexity for everyone
- Empower developers to own their infrastructure
- Keep costs ultra-low and predictable

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Django REST Framework
- **Auth:** Spring Boot microservice
- **CI/CD:** GitHub Actions, Docker
- **VPS:** Any server with SSH access

---

## 🚀 Quickstart

### Backend (Django + DRF)
```sh
cd core
python -m venv env
# Windows:
env\Scripts\activate
# Linux/Mac:
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)
```sh
cd frontend
npm install
npm run dev
```

### Auth Service (Spring Boot)
- See `/auth-service` (coming soon) for setup and API docs

---

## 🔄 Deployment Workflow
1. **Connect GitHub**
2. **Add VPS (SSH)**
3. **Configure Dockerized Project**
4. **Push to Deploy (CI/CD)**
5. **Monitor Logs & Status**

---

## 🔒 Security
- All SSH credentials are encrypted and securely stored
- Only you can access your deployments

---

## 🤝 Contributing
We love contributions! Open issues, suggest features, or submit PRs.

---

## 📄 License
MIT License

---

> DevDeploy: Modern DevOps, democratized. Own your deployment journey.
>>>>>>> efdb4c2a471b9de297d1c32abec701e24b50909a
