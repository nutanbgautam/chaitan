# Fix 401 Authentication Errors

## 🚨 **Root Cause Found!**

Your `NEXTAUTH_URL` is incorrect in Vercel environment variables.

**Current (Wrong):**
```
NEXTAUTH_URL=https://chaitan-ipos-754lm56p4-nutan-gautams-projects.vercel.app
```

**Should Be:**
```
NEXTAUTH_URL=https://chaitan-ipos.vercel.app
```

## 🔧 **Step-by-Step Fix:**

### **Step 1: Update NEXTAUTH_URL in Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click your project**: `chaitan-ipos`
3. **Go to Settings** → **Environment Variables**
4. **Find `NEXTAUTH_URL`** and update it to:
   ```
   NEXTAUTH_URL=https://chaitan-ipos.vercel.app
   ```
5. **Save the changes**

### **Step 2: Update Google OAuth Redirect URIs**

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Navigate to APIs & Services** → **Credentials**
3. **Edit your OAuth 2.0 Client ID**
4. **Add these Authorized redirect URIs**:
   ```
   https://chaitan-ipos.vercel.app/api/auth/callback/google
   https://chaitan-ipos.vercel.app/api/auth/callback/credentials
   ```
5. **Remove any old URLs** that don't match your domain
6. **Save changes**

### **Step 3: Redeploy Your App**

1. **Go to Vercel Dashboard** → **Deployments**
2. **Click "Redeploy"** on your latest deployment
3. **Wait for deployment to complete**

### **Step 4: Test the Fix**

After redeployment, test these URLs:

1. **Environment Check**: https://chaitan-ipos.vercel.app/api/auth/check-env
2. **Home Page**: https://chaitan-ipos.vercel.app
3. **Login Page**: https://chaitan-ipos.vercel.app/login
4. **Try Google Sign-in**

## 🎯 **Expected Results:**

After these fixes:
- ✅ **No more 401 errors**
- ✅ **Google Sign-in works**
- ✅ **Protected routes accessible**
- ✅ **Session management works**

## 🔍 **If Still Getting 401 Errors:**

### **Check 1: Verify Environment Variables**
Visit: https://chaitan-ipos.vercel.app/api/auth/check-env
Make sure `NEXTAUTH_URL` shows the correct domain.

### **Check 2: Test Authentication Flow**
1. Go to: https://chaitan-ipos.vercel.app/login
2. Try Google Sign-in
3. Check browser console for errors

### **Check 3: Check Vercel Logs**
1. Go to Vercel Dashboard → **Functions** tab
2. Look for any authentication errors
3. Check for Google OAuth errors

## 🚨 **Common Issues:**

### **Issue 1: Wrong Domain in Google OAuth**
- **Symptom**: Google sign-in fails with redirect error
- **Solution**: Update Google OAuth redirect URIs

### **Issue 2: NEXTAUTH_URL Mismatch**
- **Symptom**: 401 errors on all protected routes
- **Solution**: Update NEXTAUTH_URL to match actual domain

### **Issue 3: Missing Environment Variables**
- **Symptom**: App crashes or 500 errors
- **Solution**: Add all required environment variables

## 📋 **Environment Variables Checklist:**

```env
NEXTAUTH_URL=https://chaitan-ipos.vercel.app
NEXTAUTH_SECRET=your-strong-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
VERCEL=1
```

## 🎉 **After Fix:**

Your app should work perfectly with:
- ✅ Authentication working
- ✅ Google Sign-in functional
- ✅ All features accessible
- ✅ No more 401 errors

---

**Next**: Update the NEXTAUTH_URL and Google OAuth redirect URIs, then redeploy! 