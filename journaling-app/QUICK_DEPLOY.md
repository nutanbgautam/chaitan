# 🚀 Quick Deploy Guide

## ⚡ Fastest Way to Deploy

### Option 1: Vercel (Recommended - 2 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy (one command!)
npx vercel --prod
```

### Option 2: Use the Deployment Script

```bash
# Run the automated deployment script
./deploy.sh
```

## 🔧 Before You Deploy

### 1. Environment Variables
Create `.env.local` in your project root:

```env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```

### 2. Database Setup
For production, you'll need a database. Options:

**A. Supabase (Free)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string
4. Add to environment variables

**B. Railway Database**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Get connection string

## 📱 Mobile App

### Android APK
```bash
# Build Android APK
npx cap build android

# Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

### iOS App
```bash
# Open in Xcode
npx cap open ios

# Configure signing and archive
```

## 🎯 One-Click Deploy

### Vercel (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Netlify
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect your repository
4. Build command: `npm run build`
5. Publish directory: `out`

## 🔗 Quick Links

- **Vercel**: [vercel.com](https://vercel.com)
- **Netlify**: [netlify.com](https://netlify.com)
- **Railway**: [railway.app](https://railway.app)
- **Supabase**: [supabase.com](https://supabase.com)

## 🚨 Common Issues

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables
- Make sure all required env vars are set
- Check spelling and format
- Restart deployment after adding env vars

### Database Connection
- Use PostgreSQL for production
- Check connection string format
- Ensure SSL is configured

## 📞 Need Help?

1. Check the full `DEPLOYMENT_GUIDE.md`
2. Run `./deploy.sh` for guided deployment
3. Check platform-specific documentation

---

**Ready to deploy? Run `./deploy.sh` or `npx vercel --prod`! 🚀** 