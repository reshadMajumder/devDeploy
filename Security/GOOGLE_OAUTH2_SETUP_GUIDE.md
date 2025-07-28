# 🔐 Google OAuth2 Setup Guide for DevDeploy Security

This guide will walk you through creating Google OAuth2 credentials for your DevDeploy security project.

## 📋 Prerequisites

- Google account
- DevDeploy Security project running on `localhost:8081`

## 🚀 Step-by-Step Process

### Step 1: Access Google Cloud Console

1. **Open your browser** and go to: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Accept** the Terms of Service if prompted

### Step 2: Create or Select a Project

#### If you don't have a project:
1. Click **"Select a project"** dropdown at the top
2. Click **"New Project"**
3. **Project name:** `DevDeploy Security` (or your preferred name)
4. **Organization:** Leave as default (or select your organization)
5. Click **"Create"**
6. Wait for project creation (30-60 seconds)

#### If you have an existing project:
1. Click **"Select a project"** dropdown
2. Choose your existing project

### Step 3: Enable Required APIs

1. **Navigate to APIs & Services:**
   - Click the ☰ (hamburger menu) in top-left
   - Go to **"APIs & Services"** → **"Library"**

2. **Search and Enable APIs:**
   - Search for: `Google+ API`
   - Click on **"Google+ API"** 
   - Click **"Enable"**
   - Wait for API to be enabled
   - **Note:** Google+ API is deprecated but still works for OAuth2
   - **Alternative:** You can skip this step - basic OAuth2 works without enabling additional APIs

### Step 4: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen:**
   - Navigate to **"APIs & Services"** → **"OAuth consent screen"**

2. **Choose User Type:**
   - Select **"External"** (unless you have Google Workspace)
   - Click **"Create"**

3. **App Information (Required fields):**
   ```
   App name: DevDeploy Security Service
   User support email: [your-email@gmail.com]
   App logo: [Optional - skip for testing]
   App domain: [Optional - skip for testing]
   Developer contact information: [your-email@gmail.com]
   ```

4. **Click "Save and Continue"**

5. **Scopes Page:**
   - Click **"Add or Remove Scopes"**
   - **Search and add these scopes:**
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile` 
     - `openid`
   - Click **"Update"**
   - Click **"Save and Continue"**

6. **Test Users (Important for External apps):**
   - Click **"Add Users"**
   - Add your Gmail address: `your-email@gmail.com`
   - Click **"Add"**
   - Click **"Save and Continue"**

7. **Summary:**
   - Review your settings
   - Click **"Back to Dashboard"**

### Step 5: Create OAuth2 Credentials

1. **Go to Credentials:**
   - Navigate to **"APIs & Services"** → **"Credentials"**

2. **Create OAuth2 Client:**
   - Click **"+ Create Credentials"**
   - Select **"OAuth 2.0 Client IDs"**

3. **Configure Application:**
   - **Application type:** `Web application`
   - **Name:** `DevDeploy Security OAuth Client`

4. **Set Authorized JavaScript origins:**
   ```
   http://localhost:8081
   ```

5. **Set Authorized redirect URIs:**
   ```
   http://localhost:8081/login/oauth2/code/google
   ```

6. **Create:**
   - Click **"Create"**
   - **📋 IMPORTANT:** A popup will show your credentials
   - **Copy and save both:**
     - `Client ID` (looks like: `123456789-abc123.apps.googleusercontent.com`)
     - `Client Secret` (looks like: `GOCSPX-abc123def456`)

### Step 6: Configure Your Application

1. **Run the setup script:**
   ```powershell
   .\setup-oauth2.ps1
   ```

2. **Enter your credentials when prompted:**
   - Paste your **Client ID**
   - Paste your **Client Secret**

3. **The script will:**
   - Set environment variables
   - Create `.env` file
   - Validate configuration

## 🧪 Testing Your Setup

### Option 1: Automated Testing
```powershell
# Start your application
.\gradlew bootRun

# In another terminal, run tests
.\test-oauth2.ps1
```

### Option 2: Manual Browser Testing
1. **Start application:** `.\gradlew bootRun`
2. **Open browser:** http://localhost:8081/oauth2-test.html
3. **Click:** "Sign in with Google"
4. **Complete:** Google OAuth2 flow
5. **Verify:** JWT token is returned

### Option 3: Direct URL Testing
1. **OAuth2 Login:** http://localhost:8081/oauth2/authorization/google
2. **Health Check:** http://localhost:8081/api/v1/auth/health

## 🔍 Expected OAuth2 Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Redirect to Google OAuth2 authorization
   ↓
3. User authorizes DevDeploy Security
   ↓
4. Google redirects back with authorization code
   ↓
5. Spring Security exchanges code for access token
   ↓
6. OAuth2AuthenticationService creates/updates user
   ↓
7. JWT token generated and returned
   ↓
8. User can access protected endpoints with JWT
```

## ❌ Common Issues & Solutions

### Issue: "Error 400: redirect_uri_mismatch"
**Solution:** Check your redirect URIs in Google Console match exactly:
- `http://localhost:8081/login/oauth2/code/google`

### Issue: "Access blocked: This app's request is invalid"
**Solution:** 
- Ensure you've configured OAuth consent screen
- Add your email as a test user
- Verify scopes are correctly set

### Issue: "Client ID not found"
**Solution:**
- Double-check your `GOOGLE_CLIENT_ID` environment variable
- Ensure no extra spaces or characters

### Issue: "Invalid client secret"
**Solution:**
- Verify your `GOOGLE_CLIENT_SECRET` environment variable
- Regenerate secret if needed in Google Console

## 🔒 Security Best Practices

1. **Never commit credentials to Git:**
   ```bash
   # Add to .gitignore
   .env
   *.env
   ```

2. **Use environment variables in production:**
   ```yaml
   # production.yml
   spring:
     security:
       oauth2:
         client:
           registration:
             google:
               client-id: ${GOOGLE_CLIENT_ID}
               client-secret: ${GOOGLE_CLIENT_SECRET}
   ```

3. **Rotate secrets regularly**
4. **Use different credentials for different environments**

## 📞 Support

If you encounter issues:
1. Check the **Google Cloud Console** error messages
2. Review **application logs** for detailed errors
3. Verify **redirect URIs** are exactly matching
4. Ensure **test users** are added for external apps

## ✅ Success Indicators

You know it's working when:
- ✅ Google OAuth2 flow completes without errors
- ✅ JWT token is generated after authentication
- ✅ Protected endpoints respond with user data
- ✅ H2 database shows new user records with `GOOGLE` auth provider

---

**🎉 Congratulations!** Your Google OAuth2 integration is now ready for testing!
