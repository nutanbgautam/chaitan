# Vercel Environment Variables Check

## 🔍 **Check Your Vercel Environment Variables**

### **Step 1: Go to Vercel Dashboard**
1. Visit: https://vercel.com/dashboard
2. Click on your project: `chaitan-ipos`
3. Go to **Settings** → **Environment Variables**

### **Step 2: Verify These Variables Exist**

**Required Variables:**
```env
# NextAuth Configuration
NEXTAUTH_URL=https://chaitan-ipos.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Production Settings
NODE_ENV=production
VERCEL=1
```

**Optional (for Supabase):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Step 3: Generate NextAuth Secret**

If `NEXTAUTH_SECRET` is missing or weak:

```bash
# Generate a strong secret
openssl rand -base64 32
```

### **Step 4: Update Google OAuth Redirect URIs**

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add these **Authorized redirect URIs**:
   ```
   https://chaitan-ipos.vercel.app/api/auth/callback/google
   https://chaitan-ipos.vercel.app/api/auth/callback/credentials
   ```

### **Step 5: Redeploy After Changes**

After updating environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Missing NEXTAUTH_SECRET**
- **Symptom**: 401 errors on all auth endpoints
- **Solution**: Generate and add a strong secret

### **Issue 2: Wrong NEXTAUTH_URL**
- **Symptom**: Auth redirects fail
- **Solution**: Must be exactly `https://chaitan-ipos.vercel.app`

### **Issue 3: Google OAuth Redirect Mismatch**
- **Symptom**: Google sign-in fails
- **Solution**: Add Vercel URLs to Google OAuth settings

### **Issue 4: Missing Environment Variables**
- **Symptom**: App crashes or 500 errors
- **Solution**: Add all required variables

## 🔧 **Quick Fix Commands:**

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Check current environment
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET
```

## 📋 **Environment Variables Checklist:**

- [ ] `NEXTAUTH_URL=https://chaitan-ipos.vercel.app`
- [ ] `NEXTAUTH_SECRET` (32+ character random string)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `OPENAI_API_KEY`
- [ ] `NODE_ENV=production`
- [ ] `VERCEL=1`

## 🎯 **Test After Fix:**

1. Visit: https://chaitan-ipos.vercel.app
2. Try to sign in with Google
3. Check if you can access protected pages
4. Monitor Vercel logs for errors

---

**Next**: Follow this guide to check and fix your environment variables! 