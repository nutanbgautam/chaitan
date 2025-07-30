# 📱 Mobile App Development Guide

## 🚀 **Prerequisites**

### **For Android APK:**

1. **Install Java Development Kit (JDK) 17+**
   ```bash
   # Using Homebrew
   brew install openjdk@17
   
   # Or download from Oracle
   # https://www.oracle.com/java/technologies/downloads/
   ```

2. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK
   - Set up ANDROID_HOME environment variable

3. **Install Android SDK**
   ```bash
   # Add to your ~/.zshrc or ~/.bash_profile
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### **For iOS App:**

1. **Install Xcode**
   - Download from Mac App Store
   - Install Command Line Tools: `xcode-select --install`

2. **Apple Developer Account** (for App Store distribution)
   - Sign up at: https://developer.apple.com

## 🛠️ **Step-by-Step Process**

### **Step 1: Build the Web App**

```bash
# Navigate to your project
cd /Users/nu10/Desktop/Projects/Trials/ChaitanAppRevised/journaling-app

# Install dependencies
npm install

# Build the Next.js app
npm run build

# Export static files
npx next export
```

### **Step 2: Configure Capacitor**

Your `capacitor.config.ts` is already configured:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chaitan.app',
  appName: 'Chaitan.ai',
  webDir: 'out'
};

export default config;
```

### **Step 3: Sync with Capacitor**

```bash
# Sync the web build with Capacitor
npx cap sync
```

### **Step 4: Build Android APK**

#### **Option A: Using Capacitor CLI (Recommended)**
```bash
# Build Android APK
npx cap build android

# The APK will be located at:
# android/app/build/outputs/apk/release/app-release.apk
```

#### **Option B: Using Android Studio**
```bash
# Open Android project in Android Studio
npx cap open android

# In Android Studio:
# 1. Build → Build Bundle(s) / APK(s) → Build APK(s)
# 2. Find APK in: android/app/build/outputs/apk/debug/
```

#### **Option C: Command Line Build**
```bash
cd android
./gradlew assembleRelease

# For debug version
./gradlew assembleDebug
```

### **Step 5: Build iOS App**

#### **Option A: Using Capacitor CLI**
```bash
# Add iOS platform (if not already added)
npx cap add ios

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

#### **Option B: Manual iOS Setup**
```bash
# In Xcode:
# 1. Configure signing and capabilities
# 2. Select your team
# 3. Set bundle identifier
# 4. Archive and upload to App Store Connect
```

## 🔧 **Configuration Files**

### **Android Configuration**

#### **android/app/src/main/AndroidManifest.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name="com.chaitan.app.MainActivity"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:exported="true"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

#### **android/app/build.gradle**
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.chaitan.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
}
```

### **iOS Configuration**

#### **ios/App/App/Info.plist**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Chaitan.ai</string>
    <key>CFBundleIdentifier</key>
    <string>com.chaitan.app</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
</dict>
</plist>
```

## 📦 **Build Scripts**

### **Automated Build Script**
```bash
#!/bin/bash

echo "🚀 Building Mobile Apps..."

# Build web app
echo "📦 Building web app..."
npm run build
npx next export

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Build Android
echo "🤖 Building Android APK..."
npx cap build android

# Build iOS
echo "🍎 Building iOS app..."
npx cap build ios

echo "✅ Build complete!"
echo "📱 Android APK: android/app/build/outputs/apk/release/app-release.apk"
echo "🍎 iOS: Open ios/App.xcworkspace in Xcode"
```

### **Quick Commands**

#### **Android APK Only:**
```bash
npm run build
npx next export
npx cap sync
npx cap build android
```

#### **iOS Only:**
```bash
npm run build
npx next export
npx cap sync
npx cap open ios
```

## 🔍 **Troubleshooting**

### **Common Android Issues:**

1. **Java not found:**
   ```bash
   # Install Java
   brew install openjdk@17
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17
   ```

2. **Gradle build fails:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

3. **SDK not found:**
   ```bash
   # Set ANDROID_HOME
   export ANDROID_HOME=$HOME/Library/Android/sdk
   ```

### **Common iOS Issues:**

1. **Xcode not found:**
   ```bash
   xcode-select --install
   ```

2. **Signing issues:**
   - Open Xcode
   - Select your team
   - Set bundle identifier

3. **Simulator issues:**
   ```bash
   # Open iOS Simulator
   open -a Simulator
   ```

## 📱 **Testing**

### **Android Testing:**
```bash
# Run on connected device
npx cap run android

# Run on emulator
npx cap run android --target=Pixel_4_API_30
```

### **iOS Testing:**
```bash
# Run on simulator
npx cap run ios

# Run on device
npx cap run ios --target="iPhone 14"
```

## 🚀 **Distribution**

### **Android APK Distribution:**
1. **Google Play Store:**
   - Create developer account
   - Upload APK/AAB
   - Configure store listing

2. **Direct APK:**
   - Share APK file directly
   - Users enable "Unknown sources"

### **iOS App Distribution:**
1. **App Store:**
   - Archive in Xcode
   - Upload to App Store Connect
   - Submit for review

2. **TestFlight:**
   - Upload to App Store Connect
   - Invite testers via email

## 📋 **Checklist**

### **Before Building:**
- [ ] Environment variables configured
- [ ] Database setup for production
- [ ] API endpoints working
- [ ] Authentication configured
- [ ] PWA features working

### **Android Checklist:**
- [ ] Java JDK 17+ installed
- [ ] Android Studio installed
- [ ] Android SDK configured
- [ ] ANDROID_HOME set
- [ ] App icon created
- [ ] App name configured

### **iOS Checklist:**
- [ ] Xcode installed
- [ ] Apple Developer account
- [ ] Bundle identifier set
- [ ] Signing configured
- [ ] App icon created
- [ ] App name configured

## 🎯 **Quick Start Commands**

```bash
# Complete mobile build
npm run build
npx next export
npx cap sync
npx cap build android
npx cap open ios
```

---

**Happy Mobile Development! 📱🚀** 