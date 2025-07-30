#!/bin/bash

echo "🚀 Building Chaitan Journal Mobile APK..."

# Set environment variables
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Create a simple APK structure
mkdir -p apk-build/assets
mkdir -p apk-build/res/drawable
mkdir -p apk-build/res/layout
mkdir -p apk-build/res/values

# Create a simple AndroidManifest.xml
cat > apk-build/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.chaitan.journal">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/AppTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Create strings.xml
cat > apk-build/res/values/strings.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Chaitan Journal</string>
</resources>
EOF

# Create styles.xml
cat > apk-build/res/values/styles.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#667eea</item>
        <item name="colorPrimaryDark">#764ba2</item>
        <item name="colorAccent">#FFD700</item>
    </style>
</resources>
EOF

# Create main layout
cat > apk-build/res/layout/activity_main.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@drawable/gradient_bg">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:layout_marginTop="100dp"
        android:text="📱"
        android:textSize="72sp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:layout_marginTop="20dp"
        android:text="@string/app_name"
        android:textSize="24sp"
        android:textStyle="bold"
        android:textColor="#FFFFFF" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:layout_marginTop="10dp"
        android:text="Your Personal Wellness Companion"
        android:textSize="16sp"
        android:textColor="#FFFFFF"
        android:alpha="0.8" />

    <ProgressBar
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:layout_marginTop="40dp"
        android:indeterminate="true"
        android:indeterminateTint="#FFFFFF" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:layout_marginTop="20dp"
        android:text="Loading your mobile experience..."
        android:textSize="14sp"
        android:textColor="#FFFFFF"
        android:alpha="0.7" />

</LinearLayout>
EOF

# Create gradient background drawable
cat > apk-build/res/drawable/gradient_bg.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <gradient
        android:startColor="#667eea"
        android:endColor="#764ba2"
        android:angle="135" />
</shape>
EOF

# Create a simple launcher icon
cat > apk-build/res/drawable/ic_launcher.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#667eea"
        android:pathData="M54,54m-48,0a48,48 0,1 1,96 0a48,48 0,1 1,-96 0" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,30 L60,45 L75,45 L65,55 L70,70 L54,60 L38,70 L43,55 L33,45 L48,45 Z" />
</vector>
EOF

echo "✅ APK structure created successfully!"
echo "📱 APK files are ready in: apk-build/"
echo ""
echo "To build the actual APK, you would need:"
echo "1. Android Studio or complete Android SDK"
echo "2. Run: ./gradlew assembleDebug"
echo "3. Find APK in: android/app/build/outputs/apk/debug/"
echo ""
echo "For now, the mobile app structure is ready!" 