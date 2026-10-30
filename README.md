<div align="center">
  <h1>HB+ Auth</h1>
  <p><strong>One secure sign-in experience for web, Android, and iOS.</strong></p>
  <p>
    <a href="https://hbplus-auth.vercel.app/"><strong>Launch the live app ↗</strong></a>
  </p>
  <p>
    <a href="https://hbplus-auth.vercel.app/"><img alt="Live on Vercel" src="https://img.shields.io/badge/Live%20App-Vercel-000000?logo=vercel&logoColor=white"></a>
    <img alt="Expo SDK 58" src="https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white">
    <img alt="React Native 0.88" src="https://img.shields.io/badge/React%20Native-0.88-20232A?logo=react&logoColor=61DAFB">
    <img alt="Firebase Authentication" src="https://img.shields.io/badge/Firebase-Authentication-FFCA28?logo=firebase&logoColor=111827">
  </p>
</div>

HB+ Auth is a cross-platform application built with Expo, React Native, and React Native Web. It uses Google sign-in and Firebase Authentication, with access intended for verified **@hbplus.fit** accounts.

## ✦ What you get

- **One codebase:** web, Android, and iOS.
- **Google sign-in:** Firebase popup on web and native Google sign-in on mobile.
- **Protected dashboard:** unauthenticated users are sent back to login.
- **Persistent mobile sessions:** Firebase Auth restores sessions using AsyncStorage.
- **Domain gate:** the app checks for a verified **@hbplus.fit** email.
- **Responsive UI:** layouts adapt to browser and mobile screen sizes.

## 🔐 How access works

1. The user continues with Google.
2. The app signs in with Firebase Authentication.
3. The app checks that the Google email is verified and ends in **@hbplus.fit**.
4. The protected route shows the dashboard only to an eligible signed-in user.
5. The user can sign out from the dashboard.

Google receives **hbplus.fit** as a hosted-domain hint. That hint helps with account selection, but it does not enforce access by itself.

### Server-side enforcement

The repository includes Firebase Authentication blocking functions in **functions/**:

- **restrictNewAccounts** checks new accounts.
- **restrictSignIns** checks sign-ins before Firebase issues a token.

Both require a verified email in the exact **hbplus.fit** domain. **Deploy and enable these functions before relying on Firebase itself to enforce the domain policy.** Blocking functions require Firebase Authentication with Identity Platform. Deploying Cloud Functions requires the Blaze plan and a linked billing account; usage may incur charges. See [Firebase blocking functions](https://firebase.google.com/docs/functions/auth-blocking-events) and [Firebase pricing](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

## 🚀 Live web app

**[https://hbplus-auth.vercel.app/](https://hbplus-auth.vercel.app/)**

The Vercel build is configured in **vercel.json** to run **npx expo export --platform web** and publish the **dist/** folder. After a deployment, add its hostname (for example, **hbplus-auth.vercel.app**) to Firebase Authentication's **Authorized domains**.

## 🧰 Run it locally

### Requirements

- Node.js and npm
- Access to the Firebase and Google Cloud project
- Android Studio and Android SDK for local Android builds
- macOS and Xcode for local iOS builds (or use a cloud build service)

The project is configured for Firebase project **hbplus-auth-212** in **.firebaserc** and **config/firebaseApp.ts**. If you use another Firebase project, update both configurations to match.

### Install

Run these commands from the repository root:

~~~powershell
npm install
Copy-Item .env.example .env
~~~

Add your Google OAuth **client IDs** to **.env**:

~~~dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
~~~

Client IDs identify your app; they are not secrets. Never place a Google OAuth client secret in this client-side project. **.env** is ignored by Git.

### Google and Firebase setup

In the Firebase Console for this project:

1. Enable **Google** under **Authentication → Sign-in providers** and set a support email if requested.
2. Add **localhost** and your deployed hostname under **Authentication → Settings → Authorized domains**. Enter only the hostname, without **https://** or a path.
3. In the same Google Cloud project, use the **Web application** OAuth client ID for **EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID**.
4. Register the iOS app with bundle ID **fit.hbplus.auth**. Put its **iOS** OAuth client ID in **EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID**.
5. Register the Android app with package name **fit.hbplus.auth** and add the SHA-1 fingerprint for each signing key you use. Add the release key fingerprint before distributing a release build.

The native Google sign-in SDK uses the **Web** client ID to get an ID token for Firebase. Do not use an Android client ID for the Web variable. The iOS callback scheme comes from the iOS client ID, so rebuild the iOS app after changing that ID.

To find the Android debug SHA-1 in PowerShell (create the generated Android project first if needed):

~~~powershell
npx expo prebuild --platform android
Set-Location android
.\gradlew.bat signingReport
~~~

Copy the SHA-1 shown for **debug** into the Android app settings in Firebase/Google Cloud. Then return to the project root with **Set-Location ..**.

### Start the app

~~~powershell
npm run web
npm run android
npm run ios
~~~

Web runs in a browser. Android needs an emulator or connected device and a configured SDK. Local iOS builds need macOS and Xcode. Native Google sign-in requires a development build; Expo Go does not include this app's native Google sign-in module.

To create the static web build locally:

~~~powershell
npx expo export --platform web
~~~

The output is written to **dist/**.

## ☁️ Deploy the domain policy

The source code is ready, but Firebase server-side enforcement only takes effect after you deploy and enable both blocking functions:

1. Upgrade the Firebase project to **Firebase Authentication with Identity Platform**.
2. Use the **Blaze** plan for Cloud Functions. It requires a linked billing account; review costs and set budget alerts before deploying.
3. From the project root, install the Firebase CLI, sign in, install function dependencies, and deploy:

   ~~~powershell
   npm install --global firebase-tools
   firebase login
   npm install --prefix functions
   firebase deploy --only functions
   ~~~

   **.firebaserc** selects **hbplus-auth-212** by default. Confirm this is the project you intend to update.
4. In Firebase Authentication's **Blocking functions** settings, enable **restrictNewAccounts** for **before user created** and **restrictSignIns** for **before user signed in**.

Client checks protect the app's screens, but they cannot secure future database or API access on their own. Protect those resources with server-side authorization rules too.

## 🩺 Quick fixes

| If you see this | Check this |
| --- | --- |
| “This domain is not authorized” | Add your current hostname under Firebase Authentication's **Authorized domains**. |
| Google sign-in fails on web | Confirm Google is enabled in Firebase and the Web OAuth client belongs to the same Google Cloud project. |
| Google sign-in fails on Android | Confirm package **fit.hbplus.auth** and the SHA-1 for that build's signing key. |
| iOS does not return after Google sign-in | Check the iOS client ID and rebuild the app so its callback scheme is included. |
| “Access restricted” | Use a verified Google account ending in **@hbplus.fit**. |

## 📚 References

- [Expo documentation](https://docs.expo.dev/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Authentication blocking functions](https://firebase.google.com/docs/functions/auth-blocking-events)
- [Cloud Functions setup and deployment](https://firebase.google.com/docs/functions/get-started)