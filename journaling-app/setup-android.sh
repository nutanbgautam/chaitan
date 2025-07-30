#!/bin/bash

# 📱 Android Development Environment Setup Script
# This script helps set up the Android development environment

set -e

echo "📱 Setting up Android Development Environment"
echo "============================================="

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

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS. Please use the manual setup guide for other platforms."
    exit 1
fi

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    print_error "Homebrew is not installed. Please install Homebrew first:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Install Java
install_java() {
    print_status "Installing Java 17..."
    
    if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "17"; then
        brew install openjdk@17
        
        # Add to PATH
        echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
        export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
        
        print_success "Java 17 installed"
    else
        print_success "Java 17 already installed"
    fi
}

# Check Android Studio installation
check_android_studio() {
    print_status "Checking Android Studio installation..."
    
    if [ -d "/Applications/Android Studio.app" ]; then
        print_success "Android Studio is installed"
        return 0
    else
        print_warning "Android Studio is not installed"
        return 1
    fi
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Create .zshrc if it doesn't exist
    touch ~/.zshrc
    
    # Add Android SDK variables
    if ! grep -q "ANDROID_HOME" ~/.zshrc; then
        echo '' >> ~/.zshrc
        echo '# Android SDK' >> ~/.zshrc
        echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
        echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
        echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
        echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.zshrc
        echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.zshrc
        echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.zshrc
        print_success "Android SDK environment variables added"
    else
        print_success "Android SDK environment variables already set"
    fi
    
    # Add Java variables
    if ! grep -q "JAVA_HOME" ~/.zshrc; then
        echo '' >> ~/.zshrc
        echo '# Java' >> ~/.zshrc
        echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
        echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
        print_success "Java environment variables added"
    else
        print_success "Java environment variables already set"
    fi
    
    # Reload shell configuration
    source ~/.zshrc
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check Java
    if command -v java &> /dev/null; then
        java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        print_success "Java version: $java_version"
    else
        print_error "Java not found in PATH"
        return 1
    fi
    
    # Check Android SDK
    if [ -d "$HOME/Library/Android/sdk" ]; then
        print_success "Android SDK found at $HOME/Library/Android/sdk"
    else
        print_warning "Android SDK not found. Please install Android Studio and SDK."
        return 1
    fi
    
    # Check adb
    if command -v adb &> /dev/null; then
        print_success "ADB (Android Debug Bridge) available"
    else
        print_warning "ADB not found. Please install Android SDK Platform-Tools."
    fi
    
    return 0
}

# Build APK
build_apk() {
    print_status "Building Android APK..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the journaling-app directory"
        exit 1
    fi
    
    # Build web app
    print_status "Building web app..."
    npm run build
    
    # Sync Capacitor
    print_status "Syncing with Capacitor..."
    npx cap sync
    
    # Build Android APK
    print_status "Building Android APK..."
    npx cap build android
    
    print_success "Android APK built successfully!"
    print_status "APK location: android/app/build/outputs/apk/release/app-release.apk"
}

# Main execution
main() {
    install_java
    setup_environment
    
    if check_android_studio; then
        if verify_installation; then
            print_success "Android development environment is ready!"
            
            # Ask if user wants to build APK
            read -p "Do you want to build the Android APK now? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                build_apk
            fi
        else
            print_warning "Some components are missing. Please complete the setup manually."
        fi
    else
        print_warning "Android Studio is not installed."
        echo ""
        echo "📋 Manual Setup Required:"
        echo "1. Download Android Studio from: https://developer.android.com/studio"
        echo "2. Install Android Studio"
        echo "3. Open Android Studio and install SDK components:"
        echo "   - Android SDK Platform 34"
        echo "   - Android SDK Build-Tools 34.0.0"
        echo "   - Android SDK Command-line Tools"
        echo "   - Android Emulator"
        echo "   - Android SDK Platform-Tools"
        echo "4. Run this script again"
        echo ""
    fi
    
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Install Android Studio (if not already installed)"
    echo "2. Install Android SDK components"
    echo "3. Run: source ~/.zshrc"
    echo "4. Run: ./setup-android.sh (again)"
    echo "5. Build APK: npm run build && npx cap sync && npx cap build android"
    echo ""
    echo "📱 Alternative: Use GitHub Actions for automated builds"
    echo "   Push to main branch to trigger automatic APK build"
}

# Run main function
main 