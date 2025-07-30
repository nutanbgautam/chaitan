# 🚀 Deploy Chaitan Journaling App to Vercel

This guide will help you deploy your Chaitan Journaling App to Vercel.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be on GitHub (✅ Done)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **API Keys**: You'll need:
   - OpenAI API Key
   - Google OAuth Credentials
   - NextAuth Secret

## 🔧 Step 1: Prepare Environment Variables

### Generate NextAuth Secret
```bash
# Generate a secure secret
openssl rand -base64 32
```

### Update Google OAuth Redirect URIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth 2.0 credentials
3. Add these redirect URIs:
   - `https://your-app-name.vercel.app/api/auth/callback/google`
   - `https://your-app-name.vercel.app/api/auth/callback/google`

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import GitHub Repository**
   - Click "Import Git Repository"
   - Select your `chaitan` repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `journaling-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=file:./data/journaling-app.db
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-generated-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   OPENAI_API_KEY=your-openai-api-key
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd journaling-app
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add OPENAI_API_KEY
   ```

## 🔧 Step 3: Configure Database

### SQLite on Vercel
Since Vercel uses serverless functions, SQLite will be read-only. For production, consider:

1. **Use Vercel KV** (Redis)
2. **Use Vercel Postgres**
3. **Use PlanetScale** (MySQL)
4. **Use Supabase** (PostgreSQL)

### Quick Database Migration
```bash
# If you want to migrate to a cloud database later
npm install @vercel/postgres
# or
npm install @planetscale/database
```

## 🔧 Step 4: Update Google OAuth

1. **Update Redirect URIs**
   - Go to Google Cloud Console
   - Add your Vercel domain: `https://your-app-name.vercel.app/api/auth/callback/google`

2. **Update Environment Variables**
   - In Vercel dashboard, update `NEXTAUTH_URL` to your actual domain

## 🔧 Step 5: Test Your Deployment

1. **Visit your app**: `https://your-app-name.vercel.app`
2. **Test Google Sign-in**
3. **Test journal creation**
4. **Test AI features**

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`

2. **Environment Variables Missing**
   - Verify all env vars are set in Vercel dashboard
   - Check variable names match exactly

3. **Google OAuth Errors**
   - Verify redirect URIs are correct
   - Check `NEXTAUTH_URL` matches your domain

4. **Database Errors**
   - SQLite is read-only on Vercel
   - Consider migrating to a cloud database

### Debug Commands:
```bash
# Check build locally
npm run build

# Test environment variables
vercel env ls

# Redeploy
vercel --prod
```

## 📊 Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Function Logs**: Check API route logs in dashboard
3. **Error Tracking**: Set up error monitoring

## 🔄 Continuous Deployment

- Every push to `main` branch will auto-deploy
- Preview deployments for pull requests
- Easy rollback to previous versions

## 🎉 Success!

Your Chaitan Journaling App is now live on Vercel!

**Next Steps:**
1. Set up custom domain (optional)
2. Configure monitoring
3. Set up database migration
4. Add team members

---

**Need Help?**
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Issues](https://github.com/nutanbgautam/chaitan/issues) 