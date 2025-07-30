#!/bin/bash

# 🚀 Chaitan Journaling App Deployment Script
# This script helps you deploy your app to various platforms

set -e

echo "🚀 Chaitan Journaling App Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the journaling-app directory"
    exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Please create it with your environment variables"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to build the app
build_app() {
    print_status "Building the application..."
    
    # Install dependencies
    npm install
    
    # Build the app
    npm run build
    
    print_success "Build completed successfully"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    print_success "Deployed to Vercel successfully"
}

# Function to build Android APK
build_android() {
    print_status "Building Android APK..."
    
    # Build the web app
    npm run build
    
    # Export static files
    npx next export
    
    # Sync with Capacitor
    npx cap sync
    
    # Build Android
    npx cap build android
    
    print_success "Android build completed"
    print_status "APK location: android/app/build/outputs/apk/release/app-release.apk"
}

# Function to show deployment options
show_menu() {
    echo ""
    echo "Choose deployment option:"
    echo "1) Deploy to Vercel (Web)"
    echo "2) Build Android APK"
    echo "3) Build for iOS"
    echo "4) Deploy to Netlify"
    echo "5) Deploy to Railway"
    echo "6) Build only (no deploy)"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
}

# Function to deploy to Netlify
deploy_netlify() {
    print_status "Preparing for Netlify deployment..."
    
    # Update next.config.ts for static export
    if ! grep -q "output: 'export'" next.config.ts; then
        print_warning "Please update next.config.ts to include: output: 'export'"
        print_status "Add this to your next.config.ts:"
        echo "output: 'export',"
        echo "trailingSlash: true,"
        echo "images: { unoptimized: true }"
    fi
    
    # Build for static export
    npm run build
    
    print_success "Static export completed"
    print_status "Upload the 'out' folder to Netlify"
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Deploy to Railway
    railway up
    
    print_success "Deployed to Railway successfully"
}

# Function to build for iOS
build_ios() {
    print_status "Preparing for iOS build..."
    
    # Add iOS platform
    npx cap add ios
    
    # Sync with Capacitor
    npx cap sync ios
    
    # Open in Xcode
    npx cap open ios
    
    print_success "iOS project opened in Xcode"
    print_status "Configure signing and archive in Xcode"
}

# Main execution
main() {
    check_prerequisites
    build_app
    
    while true; do
        show_menu
        
        case $choice in
            1)
                deploy_vercel
                break
                ;;
            2)
                build_android
                break
                ;;
            3)
                build_ios
                break
                ;;
            4)
                deploy_netlify
                break
                ;;
            5)
                deploy_railway
                break
                ;;
            6)
                print_success "Build completed. No deployment performed."
                break
                ;;
            7)
                print_status "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-7."
                ;;
        esac
    done
    
    print_success "Deployment process completed!"
}

# Run main function
main 