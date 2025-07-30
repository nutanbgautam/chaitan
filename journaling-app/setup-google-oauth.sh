#!/bin/bash

# 🔐 Google OAuth Setup Script
# This script helps you set up Google OAuth for your app

set -e

echo "🔐 Google OAuth Setup for Chaitan App"
echo "====================================="

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

# Check if .env.local exists
check_env_file() {
    if [ -f ".env.local" ]; then
        print_success ".env.local file exists"
        return 0
    else
        print_warning ".env.local file not found"
        return 1
    fi
}

# Generate secret key
generate_secret() {
    print_status "Generating NEXTAUTH_SECRET..."
    secret=$(openssl rand -base64 32)
    print_success "Generated secret: $secret"
    return 0
}

# Create .env.local template
create_env_template() {
    print_status "Creating .env.local template..."
    
    # Generate secret
    secret=$(openssl rand -base64 32)
    
    cat > .env.local << EOF
# Database
DATABASE_URL=file:./data/journaling-app.db

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=$secret

# Google OAuth (Replace with your actual credentials)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# OpenAI (if using)
OPENAI_API_KEY=your-openai-api-key-here

# Production settings
NODE_ENV=development
EOF
    
    print_success ".env.local template created"
    print_warning "Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET with your actual values"
}

# Show setup instructions
show_instructions() {
    echo ""
    echo "📋 Google OAuth Setup Instructions:"
    echo "=================================="
    echo ""
    echo "1. Go to Google Cloud Console:"
    echo "   https://console.cloud.google.com/"
    echo ""
    echo "2. Create a new project or select existing"
    echo ""
    echo "3. Enable APIs:"
    echo "   - Go to APIs & Services → Library"
    echo "   - Search for 'Google+ API' or 'Google Identity'"
    echo "   - Click Enable"
    echo ""
    echo "4. Create OAuth Credentials:"
    echo "   - Go to APIs & Services → Credentials"
    echo "   - Click 'Create Credentials' → 'OAuth client ID'"
    echo "   - Application type: Web application"
    echo "   - Name: 'Chaitan Journaling App'"
    echo ""
    echo "5. Add Authorized JavaScript origins:"
    echo "   http://localhost:3000"
    echo "   http://localhost:3003"
    echo "   https://your-domain.com (for production)"
    echo ""
    echo "6. Add Authorized redirect URIs:"
    echo "   http://localhost:3000/api/auth/callback/google"
    echo "   http://localhost:3003/api/auth/callback/google"
    echo "   https://your-domain.com/api/auth/callback/google (for production)"
    echo ""
    echo "7. Copy your Client ID and Client Secret"
    echo ""
    echo "8. Update .env.local with your credentials:"
    echo "   GOOGLE_CLIENT_ID=your-actual-client-id"
    echo "   GOOGLE_CLIENT_SECRET=your-actual-client-secret"
    echo ""
    echo "9. Restart your development server:"
    echo "   npm run dev"
    echo ""
    echo "10. Test Google Sign-in at:"
    echo "    http://localhost:3003/login"
    echo ""
}

# Test configuration
test_configuration() {
    print_status "Testing configuration..."
    
    if [ -f ".env.local" ]; then
        # Check if Google credentials are set
        if grep -q "your-google-client-id-here" .env.local; then
            print_warning "Google credentials not configured yet"
            print_status "Please follow the setup instructions above"
        else
            print_success "Google credentials appear to be configured"
        fi
        
        # Check if secret is generated
        if grep -q "your-secret-key-here" .env.local; then
            print_warning "NEXTAUTH_SECRET not generated"
        else
            print_success "NEXTAUTH_SECRET is configured"
        fi
    else
        print_error ".env.local file not found"
    fi
}

# Main execution
main() {
    echo ""
    
    if check_env_file; then
        print_status "Environment file exists"
        test_configuration
    else
        print_status "Creating environment file..."
        create_env_template
    fi
    
    show_instructions
    
    echo ""
    echo "🎯 Quick Commands:"
    echo "=================="
    echo ""
    echo "1. Generate new secret:"
    echo "   openssl rand -base64 32"
    echo ""
    echo "2. Restart development server:"
    echo "   npm run dev"
    echo ""
    echo "3. Test Google sign-in:"
    echo "   Open http://localhost:3003/login"
    echo ""
    echo "4. Check logs for errors:"
    echo "   Check browser console and terminal output"
    echo ""
    
    print_success "Setup script completed!"
    print_warning "Remember to update .env.local with your actual Google credentials"
}

# Run main function
main 