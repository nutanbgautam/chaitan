#!/bin/bash

# 🚀 Quick Server Deployment Script for Chaitan App
# Run this script on your server to deploy the app

set -e

echo "🚀 Chaitan App - Server Deployment"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run as root. Use a regular user with sudo privileges."
    exit 1
fi

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Installing..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        print_status "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        print_status "Installing Nginx..."
        sudo apt update
        sudo apt install nginx -y
        sudo systemctl start nginx
        sudo systemctl enable nginx
    fi
    
    print_success "Prerequisites check completed"
}

# Setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    # Create app directory
    sudo mkdir -p /var/www/chaitan-app
    sudo chown $USER:$USER /var/www/chaitan-app
    
    # Navigate to app directory
    cd /var/www/chaitan-app
    
    print_success "Application directory ready"
}

# Deploy application
deploy_app() {
    print_status "Deploying application..."
    
    cd /var/www/chaitan-app
    
    # If this is a fresh deployment, you'll need to upload files
    if [ ! -f "package.json" ]; then
        print_warning "No application files found."
        print_status "Please upload your application files to /var/www/chaitan-app/"
        print_status "You can use SCP: scp -r ./journaling-app/* user@server:/var/www/chaitan-app/"
        exit 1
    fi
    
    # Install dependencies
    npm install
    
    # Create environment file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        cat > .env.local << EOF
# Database
DATABASE_URL=file:./data/journaling-app.db

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Google OAuth (optional)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI (optional)
# OPENAI_API_KEY=your-openai-api-key

# Production settings
NODE_ENV=production
EOF
        print_warning "Please update .env.local with your actual values"
    fi
    
    # Build application
    npm run build
    
    print_success "Application deployed"
}

# Setup PM2
setup_pm2() {
    print_status "Setting up PM2..."
    
    # Create PM2 ecosystem file
    cat > /var/www/chaitan-app/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'chaitan-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/chaitan-app',
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
EOF
    
    # Create log directory
    sudo mkdir -p /var/log/chaitan-app
    sudo chown $USER:$USER /var/log/chaitan-app
    
    # Start PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_success "PM2 configured and started"
}

# Setup Nginx
setup_nginx() {
    print_status "Setting up Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/chaitan-app > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location /_next/static/ {
        alias /var/www/chaitan-app/.next/static/;
        expires 365d;
        access_log off;
    }

    # Public files
    location /public/ {
        alias /var/www/chaitan-app/public/;
        expires 30d;
        access_log off;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/chaitan-app /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    print_success "Nginx configured"
}

# Setup SSL (optional)
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Check if Certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_status "Installing Certbot..."
        sudo apt install certbot python3-certbot-nginx -y
    fi
    
    read -p "Enter your domain name (e.g., yourdomain.com): " domain
    
    if [ -n "$domain" ]; then
        # Update Nginx config with domain
        sudo sed -i "s/your-domain.com/$domain/g" /etc/nginx/sites-available/chaitan-app
        sudo systemctl reload nginx
        
        # Get SSL certificate
        sudo certbot --nginx -d $domain -d www.$domain --non-interactive --agree-tos --email admin@$domain
        
        print_success "SSL certificate installed for $domain"
    else
        print_warning "Skipping SSL setup. You can run 'sudo certbot --nginx' later."
    fi
}

# Create update script
create_update_script() {
    print_status "Creating update script..."
    
    cat > /var/www/chaitan-app/update.sh << 'EOF'
#!/bin/bash

echo "🔄 Updating Chaitan App..."

cd /var/www/chaitan-app

# Pull latest changes (if using Git)
# git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Restart PM2
pm2 restart chaitan-app

echo "✅ Update completed!"
EOF
    
    chmod +x /var/www/chaitan-app/update.sh
    
    print_success "Update script created: /var/www/chaitan-app/update.sh"
}

# Main deployment
main() {
    print_status "Starting deployment..."
    
    check_prerequisites
    setup_app_directory
    deploy_app
    setup_pm2
    setup_nginx
    setup_ssl
    create_update_script
    
    print_success "🎉 Deployment completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update .env.local with your actual values"
    echo "2. Update Nginx config with your domain"
    echo "3. Run: pm2 status (to check app status)"
    echo "4. Run: sudo nginx -t (to test Nginx config)"
    echo "5. Visit your domain to test the app"
    echo ""
    echo "🔄 To update the app later, run:"
    echo "   /var/www/chaitan-app/update.sh"
}

# Run main function
main 