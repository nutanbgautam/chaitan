#!/bin/bash

# 🚀 Mobile App Build Script for Chaitan Journaling App
# This script builds both Android APK and iOS app

set -e

echo "🚀 Chaitan Mobile App Build Script"
echo "=================================="

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
    
    # Check Java (for Android)
    if ! command -v java &> /dev/null; then
        print_warning "Java is not installed. Android build may fail."
        print_status "Install Java: brew install openjdk@17"
    fi
    
    # Check Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME is not set. Android build may fail."
        print_status "Set ANDROID_HOME in your shell profile"
    fi
    
    # Check Xcode (for iOS)
    if ! command -v xcodebuild &> /dev/null; then
        print_warning "Xcode is not installed. iOS build may fail."
        print_status "Install Xcode from Mac App Store"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to build web app
build_web_app() {
    print_status "Building web application..."
    
    # Install dependencies
    npm install
    
    # Build the app
    npm run build
    
    # Export static files
    npx next export
    
    print_success "Web app build completed"
}

# Function to sync with Capacitor
sync_capacitor() {
    print_status "Syncing with Capacitor..."
    
    # Sync with Capacitor
    npx cap sync
    
    print_success "Capacitor sync completed"
}

# Function to build Android APK
build_android() {
    print_status "Building Android APK..."
    
    # Check if Java is available
    if ! command -v java &> /dev/null; then
        print_error "Java is required for Android build. Please install Java JDK 17+"
        print_status "Install with: brew install openjdk@17"
        return 1
    fi
    
    # Build Android
    npx cap build android
    
    if [ $? -eq 0 ]; then
        print_success "Android APK build completed"
        print_status "APK location: android/app/build/outputs/apk/release/app-release.apk"
    else
        print_error "Android build failed"
        return 1
    fi
}

# Function to build iOS app
build_ios() {
    print_status "Building iOS app..."
    
    # Check if Xcode is available
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is required for iOS build. Please install Xcode"
        return 1
    fi
    
    # Add iOS platform if not exists
    if [ ! -d "ios" ]; then
        print_status "Adding iOS platform..."
        npx cap add ios
    fi
    
    # Sync with iOS
    npx cap sync ios
    
    # Open in Xcode
    print_status "Opening iOS project in Xcode..."
    npx cap open ios
    
    print_success "iOS project opened in Xcode"
    print_status "Configure signing and archive in Xcode"
}

# Function to show build options
show_menu() {
    echo ""
    echo "Choose build option:"
    echo "1) Build Android APK only"
    echo "2) Build iOS app only"
    echo "3) Build both Android and iOS"
    echo "4) Build web app only (no mobile)"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
}

# Main execution
main() {
    check_prerequisites
    build_web_app
    sync_capacitor
    
    while true; do
        show_menu
        
        case $choice in
            1)
                build_android
                break
                ;;
            2)
                build_ios
                break
                ;;
            3)
                build_android
                build_ios
                break
                ;;
            4)
                print_success "Web app build completed. No mobile build performed."
                break
                ;;
            5)
                print_status "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-5."
                ;;
        esac
    done
    
    print_success "Build process completed!"
    echo ""
    echo "📱 Build Results:"
    echo "=================="
    echo "🌐 Web App: out/ directory"
    echo "🤖 Android APK: android/app/build/outputs/apk/release/app-release.apk"
    echo "🍎 iOS: Open ios/App.xcworkspace in Xcode"
    echo ""
    echo "🚀 Next Steps:"
    echo "=============="
    echo "• Test the APK on Android device"
    echo "• Configure iOS signing in Xcode"
    echo "• Upload to app stores"
}

# Run main function
main 