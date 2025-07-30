# 🚀 Chaitan Journaling App - Server Deployment Guide

This guide will help you deploy your journaling app to your own server (VPS, dedicated server, or cloud instance).

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 10GB+ free space
- **Node.js**: 18.x or higher
- **PM2**: For process management
- **Nginx**: For reverse proxy
- **SSL Certificate**: Let's Encrypt recommended

### Domain & DNS
- A domain name pointing to your server
- DNS records configured

## 🛠️ Server Setup

### 1. Connect to Your Server
```bash
ssh root@your-server-ip
```

### 2. Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 3. Install Node.js
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 4. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 5. Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Install Certbot (for SSL)
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

## 📦 Application Deployment

### 1. Create Application Directory
```bash
sudo mkdir -p /var/www/chaitan-app
sudo chown $USER:$USER /var/www/chaitan-app
cd /var/www/chaitan-app
```

### 2. Clone Your Repository
```bash
# If using Git
git clone https://github.com/your-username/chaitan-app.git .

# Or upload files via SCP/SFTP
# scp -r ./journaling-app/* user@server:/var/www/chaitan-app/
```

### 3. Install Dependencies
```bash
cd /var/www/chaitan-app/journaling-app
npm install
```

### 4. Environment Configuration
```bash
# Create environment file
nano .env.local
```

Add your environment variables:
```env
# Database
DATABASE_URL=file:./data/journaling-app.db

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI (if using)
OPENAI_API_KEY=your-openai-api-key

# Other settings
NODE_ENV=production
```

### 5. Build the Application
```bash
npm run build
```

### 6. Create PM2 Configuration
```bash
nano ecosystem.config.js
```

Add this configuration:
```javascript
module.exports = {
  apps: [{
    name: 'chaitan-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/chaitan-app/journaling-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/chaitan-app/err.log',
    out_file: '/var/log/chaitan-app/out.log',
    log_file: '/var/log/chaitan-app/combined.log',
    time: true
  }]
};
```

### 7. Create Log Directory
```bash
sudo mkdir -p /var/log/chaitan-app
sudo chown $USER:$USER /var/log/chaitan-app
```

### 8. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Nginx Configuration

### 1. Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/chaitan-app
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Root directory
    root /var/www/chaitan-app/journaling-app/.next;
    index index.html;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location /_next/static/ {
        alias /var/www/chaitan-app/journaling-app/.next/static/;
        expires 365d;
        access_log off;
    }

    # Public files
    location /public/ {
        alias /var/www/chaitan-app/journaling-app/public/;
        expires 30d;
        access_log off;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/chaitan-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate Setup

### 1. Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 2. Test Auto-renewal
```bash
sudo certbot renew --dry-run
```

## 🔄 Deployment Script

Create a deployment script for easy updates:

```bash
nano deploy.sh
```

Add this content:
```bash
#!/bin/bash

echo "🚀 Deploying Chaitan App..."

# Navigate to app directory
cd /var/www/chaitan-app/journaling-app

# Pull latest changes (if using Git)
# git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Restart PM2
pm2 restart chaitan-app

echo "✅ Deployment completed!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## 📊 Monitoring & Maintenance

### 1. PM2 Commands
```bash
# View logs
pm2 logs chaitan-app

# Monitor processes
pm2 monit

# Restart app
pm2 restart chaitan-app

# Stop app
pm2 stop chaitan-app

# Start app
pm2 start chaitan-app
```

### 2. Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check system load
uptime
```

## 🔧 Troubleshooting

### Common Issues

1. **Port 3000 not accessible**
   ```bash
   # Check if app is running
   pm2 status
   
   # Check if port is in use
   sudo netstat -tlnp | grep :3000
   ```

2. **Nginx 502 Bad Gateway**
   ```bash
   # Check Nginx error logs
   sudo tail -f /var/log/nginx/error.log
   
   # Check app logs
   pm2 logs chaitan-app
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew
   ```

4. **Database Issues**
   ```bash
   # Check database file permissions
   ls -la /var/www/chaitan-app/journaling-app/data/
   
   # Fix permissions if needed
   sudo chown -R $USER:$USER /var/www/chaitan-app/journaling-app/data/
   ```

## 🚀 Quick Deployment Commands

For a quick deployment after setup:

```bash
# 1. Navigate to app directory
cd /var/www/chaitan-app/journaling-app

# 2. Pull latest changes (if using Git)
git pull origin main

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Restart PM2
pm2 restart chaitan-app

# 6. Check status
pm2 status
```

## 📱 Mobile App Deployment

### Android APK
```bash
# Build Android APK
cd /var/www/chaitan-app/journaling-app
npm run build
npx cap sync
npx cap build android

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### iOS App
```bash
# Build for iOS
cd /var/www/chaitan-app/journaling-app
npm run build
npx cap sync ios
npx cap open ios
# Configure in Xcode and archive
```

## 🔐 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Regular backups scheduled
- [ ] Monitoring alerts set up

## 📈 Performance Optimization

1. **Enable Gzip compression** (already in Nginx config)
2. **Use CDN** for static assets
3. **Implement caching** strategies
4. **Monitor performance** with tools like New Relic
5. **Regular database maintenance**

Your Chaitan Journaling App is now ready for production! 🎉 