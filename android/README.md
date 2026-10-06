# Android companion 1.0.0

Real signed APK; native entry screen opens the online mobile workspace through the preferred browser's Custom Tabs when supported, otherwise browser VIEW. No WebView, credential capture, dynamic URL inputs, deep-link handler, downloaded code, trackers, sensitive permissions or native lead storage. Not a fully native CRM and not an offline copy. Authentication remains with the browser and the private Sites gateway. Changing the hosting URL requires a new APK.

Package `com.zytrix.leads`; min API 23 (Android 6), target API 35. Outside-store installation, real login and device operation are NOT VERIFIED. Android device/region policies may block sideloading. No Play Store enrollment/payment performed.

## Rebuild

Official Android SDK Platform 35 and Build Tools 35.0.0, Java 17 JDK (or Eclipse ECJ compiler), Python 3. Use Android Studio's SDK Manager or verified Google SDK archives. `ANDROID_SDK_ROOT` points to SDK. Script accepts normal SDK layout or extracted `android-35`/`android-15` archives. `ZYTRIX_ECJ_JAR` optional absolute compiler path.

Set `ZYTRIX_ANDROID_KEYSTORE` to an absolute private signing-keystore path outside Git and `ZYTRIX_ANDROID_PASSWORD` via environment. Use alias `zytrix`. Run `python android/build.py`. It compiles resources/Java/DEX, aligns, signs with v1/v2/v3 and verifies the APK. Produces public APK and release metadata. Never regenerate the signing identity for normal updates; preserve the private backup. Bump versionCode/versionName/output filename for updates.

The original signing backup is stored privately outside Git and public website. Only the APK, public certificate fingerprint, SHA256 checksum and source are distributable. No API keys are embedded.

Official references: https://developer.android.com/tools/aapt2 · https://developer.android.com/tools/apksigner · https://developer.chrome.com/docs/android/custom-tabs/
