# Offline application builds

PALMQuest uses one Vite build for the website, Android Capacitor app, and Windows Electron app. The app content is local in each package. Fonts are bundled; no service or database is required. The optional external portfolio link in About Us needs connectivity to open.

## Android APK

Install Node.js 22+, Android Studio, and an Android SDK. Use Android Studio's JDK 21 when building with Gradle. The package ID is `org.palmquest.app`; agree on a permanent ID before a public release, since changing it later makes Android treat the build as a separate app.

```powershell
npm install
npm run android:sync
cd android
./gradlew.bat assembleDebug
```

Output: `android/app/build/outputs/apk/debug/PALMQuest.apk`. Copy this APK to a phone or tablet to install it for testing. The native activity requests sensor landscape and uses immersive fullscreen. Android may override an orientation request on some large screens, so the game layout must remain responsive.

For public distribution, create a signing key and signed **release** APK or AAB in Android Studio (`Build > Generate Signed Bundle / APK`). Keep the signing key and password safe; future updates need the same key. Sync after every web change, then rebuild the APK.

## Windows installer

```powershell
npm install
npm run desktop:make
```

Output: `out/make/squirrel.windows/x64/PALMQuestSetup.exe`. The `out/PALMQuest-win32-x64/` folder is an unpacked build; its EXE needs the other files in that folder. An unsigned installer may show a Windows reputation warning. Sign the installer before wide distribution.

## Web and offline behavior

`npm run build` produces `dist/`. The installed Android and Windows apps bundle this directory and open it locally, with no browser address bar. The website served from a URL does not have offline caching; if an offline website is also needed, add a service worker/PWA separately.

The tested compact browser viewport is 800 × 360, plus 667 × 375. A phone browser in portrait asks the learner to rotate. Native Android requests landscape on launch. Test the signed APK on at least one physical phone and tablet before release, including an airplane-mode run.
