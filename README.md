# HB+ Auth

HB+ Auth is a cross-platform sign-in app built with Expo, React Native, React Native for Web, and Firebase Authentication. It supports Google sign-in on the web, Android, and iOS, and is intended for verified accounts in the `hbplus.fit` email domain.

## What it includes

- Google sign-in using Firebase Authentication.
- Web popup sign-in and native Google sign-in on Android and iOS.
- A dashboard behind an authenticated route.
- Session restoration on native devices using Firebase Auth persistence and AsyncStorage.
- Client-side domain checks and Firebase Authentication blocking functions for server-side checks.
- A responsive React Native interface.

## Project setup

### Requirements

- Node.js and npm.
- Access to the Firebase and Google Cloud project used by this app.
- Android Studio and an Android SDK for local Android builds.
- macOS and Xcode for local iOS builds. A cloud build service can be used when developing on Windows.

This checkout is configured for Firebase project `hbplus-auth-212` in `.firebaserc` and `config/firebaseApp.ts`. If you use a different Firebase project, update the project alias and Firebase configuration to match it.

### Install and configure the app

From the repository root:

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` and replace the example values with the OAuth client IDs from the same Google Cloud project:

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

These are OAuth **client IDs**, which identify your app; they are not client secrets. Do not put a Google OAuth client secret in this app. Variables beginning with `EXPO_PUBLIC_` are included in the client app, and `.env` is ignored by Git.

### Configure Google and Firebase

In the Firebase Console for this project:

1. Open **Authentication** and enable **Google** as a sign-in provider. Set the support email if Firebase asks for one.
2. In Authentication settings, add `localhost` and your deployed website hostname to **Authorized domains**. Add only the hostname, without `https://` or a path.
3. In Google Cloud Console, copy the **Web application** OAuth client ID into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
4. Register the iOS app with bundle ID `fit.hbplus.auth`, create or locate its **iOS** OAuth client ID, and put it in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
5. Register the Android app with package name `fit.hbplus.auth` and add the SHA-1 fingerprint for the signing key you use. For local debug builds, get it with the Android Gradle `signingReport` task. Add the release signing fingerprint too before distributing a release build.

The native Google sign-in setup uses the **Web** client ID to obtain a Firebase-compatible ID token. Do not put the Android OAuth client ID in the Web client ID variable. The iOS URL callback scheme is derived from the iOS client ID during Expo configuration, so rebuild the iOS app after changing that ID.

For a local Android fingerprint, if the generated `android` directory does not exist yet, create it first:

```powershell
npx expo prebuild --platform android
Set-Location android
.\gradlew.bat signingReport
```

Copy the SHA-1 shown for the `debug` variant into the Android app settings in Firebase/Google Cloud. Return to the repository root afterward with `Set-Location ..`.

### Start the app

Run these commands from the repository root:

```powershell
npm run web
```

```powershell
npm run android
```

```powershell
npm run ios
```

The web command runs in a browser. Android requires a configured SDK and a connected device or emulator. Local iOS builds require macOS and Xcode. Native Google sign-in uses a native module, so test it in the app built by `npm run android` or `npm run ios`, not in Expo Go.

For a static web build, run:

```powershell
npx expo export --platform web
```

The build output is `dist/`. The repository includes `vercel.json` for a Vercel deployment; after deployment, add the deployed hostname to Firebase Authentication's authorized domains.

## Authentication flow

1. The user selects **Continue with Google**.
2. On web, Firebase opens Google's sign-in popup. On Android and iOS, the native Google sign-in SDK returns an ID token, which the app exchanges with Firebase Authentication.
3. Firebase's auth-state listener restores or updates the signed-in session. Native session persistence is backed by AsyncStorage.
4. The app requires a verified email ending in `@hbplus.fit`. A signed-in user who does not meet that check is signed out, and the protected route sends them to the login screen.
5. The user can sign out from the dashboard.

The `hd`/hosted-domain setting sent to Google is only a sign-in hint. It can help Google show the expected account, but it is not an access-control check.

## Domain restriction and server enforcement

The app checks that the email address is verified and matches `@hbplus.fit`. The protected route repeats that check before showing the dashboard. These client checks improve the experience, but client code by itself cannot secure Firebase data or other backend resources.

The `functions/` directory contains two Firebase Authentication blocking functions:

- `restrictNewAccounts` checks a user before account creation.
- `restrictSignIns` checks a user before Firebase issues a sign-in token.

Both require a verified email whose domain is exactly `hbplus.fit` (case-insensitive). To make Firebase enforce this policy, the project owner must complete **all** of these setup steps:

1. Upgrade the Firebase project to **Firebase Authentication with Identity Platform**. Firebase requires this for blocking functions.
2. Use the **Blaze** pricing plan to deploy Cloud Functions. It requires a linked billing account; Cloud Functions usage can incur charges. Review Firebase pricing and configure budget alerts before deploying.
3. From the repository root, install the Firebase CLI, sign in, install the function dependencies, and deploy:

   ```powershell
   npm install --global firebase-tools
   firebase login
   npm install --prefix functions
   firebase deploy --only functions
   ```

   The `.firebaserc` file selects `hbplus-auth-212` by default. Confirm that this is the project you intend to change before deploying.
4. In Firebase Authentication's **Blocking functions** settings, enable the deployed functions for **before user created** (`restrictNewAccounts`) and **before user signed in** (`restrictSignIns`).

Until those setup steps are complete, the client-side check can redirect or sign out a user in this app, but Firebase itself does not yet enforce the domain policy for every client or API. Any future Firebase database or API access must also have its own server-side authorization rules.

## Troubleshooting

- **Web says the domain is not authorized:** add `localhost` or the deployed hostname under Firebase Authentication's **Authorized domains**.
- **Google sign-in opens but fails:** confirm Google is enabled in Firebase Authentication and that the Web OAuth client ID belongs to the same Google Cloud project.
- **Android cannot complete sign-in:** check that the Android package is exactly `fit.hbplus.auth` and that Firebase/Google Cloud has the SHA-1 for the key used to sign that build.
- **iOS does not return to the app:** check the iOS OAuth client ID and rebuild after changing it so the callback URL scheme is included in the native app.
- **A user is denied:** use a verified Google account ending in `@hbplus.fit`. The domain hint in Google's sign-in screen does not override this rule.
- **Deploying the blocking functions fails:** confirm the selected Firebase project, Identity Platform setup, Blaze plan, Firebase CLI login, and required project permissions.

## Useful references

- [Expo documentation](https://docs.expo.dev/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Authentication blocking functions](https://firebase.google.com/docs/functions/auth-blocking-events)
- [Cloud Functions for Firebase setup and deployment](https://firebase.google.com/docs/functions/get-started)
- [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
