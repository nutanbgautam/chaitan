# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth for your Chaitan Journaling App.

## 🚀 Quick Setup Steps

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project:**
   - Click project dropdown → "New Project"
   - Name: "Chaitan Journaling App"
   - Click "Create"

### Step 2: Enable APIs

1. **Go to APIs & Services → Library**
2. **Search and enable these APIs:**
   - "Google+ API" or "Google Identity"
   - "Google Identity and Access Management (IAM) API"

### Step 3: Create OAuth Credentials

1. **Go to APIs & Services → Credentials**
2. **Click "Create Credentials" → "OAuth client ID"**
3. **Configure OAuth consent screen:**
   - User Type: External
   - App name: "Chaitan Journaling App"
   - User support email: your-email@gmail.com
   - Developer contact information: your-email@gmail.com

4. **Create OAuth Client ID:**
   - Application type: Web application
   - Name: "Chaitan Journaling App"
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     http://localhost:3003
     https://your-domain.com
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/api/auth/callback/google
     http://localhost:3003/api/auth/callback/google
     https://your-domain.com/api/auth/callback/google
     ```

### Step 4: Get Your Credentials

After creating the OAuth client ID, you'll get:
- **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

### Step 5: Create Environment File

Create a `.env.local` file in your `journaling-app` directory:

```env
# Database
DATABASE_URL=file:./data/journaling-app.db

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth (Replace with your actual credentials)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# OpenAI (if using)
OPENAI_API_KEY=your-openai-api-key-here

# Production settings
NODE_ENV=development
```

### Step 6: Generate Secret Key

Generate a secure secret key:

```bash
# In your terminal
openssl rand -base64 32
```

Replace `your-secret-key-here-change-in-production` with the generated key.

### Step 7: Test the Setup

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test Google Sign-in:**
   - Go to http://localhost:3003/login
   - Click "Continue with Google"
   - Should work without errors

## 🔧 Troubleshooting

### Common Issues:

#### 1. "redirect_uri_mismatch" Error
**Solution:** Make sure your redirect URIs in Google Cloud Console match exactly:
```
http://localhost:3003/api/auth/callback/google
```

#### 2. "invalid_client" Error
**Solution:** Check that your Client ID and Client Secret are correct in `.env.local`

#### 3. "access_denied" Error
**Solution:** Make sure you've enabled the Google+ API in your Google Cloud project

#### 4. "redirect_uri_mismatch" for Production
**Solution:** Add your production domain to authorized redirect URIs:
```
https://your-domain.com/api/auth/callback/google
```

### Verification Checklist:

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Authorized redirect URIs added
- [ ] `.env.local` file created with correct credentials
- [ ] NEXTAUTH_SECRET generated
- [ ] Development server restarted
- [ ] Google sign-in tested

## 🚀 Production Setup

For production deployment, update your Google OAuth settings:

1. **Add production domain to authorized redirect URIs:**
   ```
   https://your-domain.com/api/auth/callback/google
   ```

2. **Update environment variables:**
   ```env
   NEXTAUTH_URL=https://your-domain.com
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Generate production secret:**
   ```bash
   openssl rand -base64 32
   ```

## 📱 Mobile App Setup

For mobile apps, you'll need additional redirect URIs:

```
com.chaitan.app://oauth2redirect
```

Add this to your Google OAuth client configuration.

## 🔒 Security Best Practices

1. **Never commit `.env.local` to Git**
2. **Use different OAuth credentials for development and production**
3. **Rotate secrets regularly**
4. **Use HTTPS in production**
5. **Set up proper CORS if needed**

## 📞 Support

If you still have issues:

1. Check the Google Cloud Console error logs
2. Verify all environment variables are set correctly
3. Ensure the redirect URIs match exactly
4. Test with a fresh browser session
5. Check the NextAuth.js documentation

---

**Happy Authenticating! 🔐** 