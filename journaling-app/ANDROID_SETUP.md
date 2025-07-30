# 📱 Android Development Setup Guide

This guide will help you set up the Android development environment to build APK files for your Chaitan Journaling App.

## 🚀 Quick Setup Options

### Option 1: Install Android Studio (Recommended)

#### Step 1: Download Android Studio
1. Go to [Android Studio Download Page](https://developer.android.com/studio)
2. Download Android Studio for macOS
3. Install Android Studio

#### Step 2: Install Android SDK
1. Open Android Studio
2. Go to **Tools** → **SDK Manager**
3. Install the following:
   - **Android SDK Platform 34** (or latest)
   - **Android SDK Build-Tools 34.0.0**
   - **Android SDK Command-line Tools**
   - **Android Emulator**
   - **Android SDK Platform-Tools**

#### Step 3: Set Environment Variables
Add these to your `~/.zshrc` file:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Java
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

Then reload your shell:
```bash
source ~/.zshrc
```

#### Step 4: Verify Installation
```bash
# Check Android SDK
adb version

# Check Java
java -version

# Check Android SDK location
echo $ANDROID_HOME
```

### Option 2: Use Command Line Tools Only

If you don't want to install the full Android Studio:

```bash
# Install Android command line tools
brew install android-commandlinetools

# Set environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 🔧 Build Android APK

### Step 1: Build Web App
```bash
cd journaling-app
npm run build
```

### Step 2: Sync with Capacitor
```bash
npx cap sync
```

### Step 3: Build Android APK
```bash
npx cap build android
```

### Step 4: Find the APK
The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Unable to locate a Java Runtime"
**Solution**: Install Java 17
```bash
brew install openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

#### 2. "Android SDK not found"
**Solution**: Set ANDROID_HOME environment variable
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 3. "Gradle build failed"
**Solution**: Clean and rebuild
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

#### 4. "Permission denied"
**Solution**: Make gradlew executable
```bash
chmod +x android/gradlew
```

## 📱 Alternative: Cloud Build Services

If you don't want to set up the local Android environment, you can use cloud build services:

### Option 1: Appetize.io
1. Upload your web app
2. They'll build the APK for you
3. Download the APK

### Option 2: Capacitor Cloud
1. Use Capacitor's cloud build service
2. Automatic APK generation
3. No local setup required

### Option 3: GitHub Actions
Create a GitHub Action to build APK automatically:

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      
    - name: Install dependencies
      run: npm install
      
    - name: Build web app
      run: npm run build
      
    - name: Sync Capacitor
      run: npx cap sync
      
    - name: Build Android APK
      run: npx cap build android
      
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release
        path: android/app/build/outputs/apk/release/app-release.apk
```

## 🚀 Quick Commands

### Complete Setup (One-time)
```bash
# 1. Install Java
brew install openjdk@17

# 2. Set environment variables
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc

# 3. Install Android Studio and SDK (manual step)
# Download from: https://developer.android.com/studio

# 4. Build APK
cd journaling-app
npm run build
npx cap sync
npx cap build android
```

### Build APK (After setup)
```bash
cd journaling-app
npm run build
npx cap sync
npx cap build android
```

## 📋 Verification Checklist

- [ ] Java 17 installed and in PATH
- [ ] Android Studio installed
- [ ] Android SDK installed
- [ ] ANDROID_HOME environment variable set
- [ ] Gradle wrapper executable
- [ ] Web app builds successfully
- [ ] Capacitor syncs without errors
- [ ] Android build completes
- [ ] APK file generated

## 🎯 Next Steps

After building the APK:

1. **Test the APK** on an Android device
2. **Sign the APK** for distribution
3. **Upload to Google Play Store** (optional)
4. **Share the APK** directly with users

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure Android Studio and SDK are properly installed
4. Try cleaning and rebuilding the project

---

**Happy Building! 📱** 