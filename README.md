# Team SN Home Budget System

A family budget web app for Bokx and Missy, hosted on GitHub Pages.

- Works on iPhone and Android. Open the site, then use **Add to Home Screen**.
- Entries sync between both phones through Firebase (Firestore). Only the two
  Google accounts listed in the Firestore security rules can read or write data.
- No budget figures are stored in this repository.

## Files
- `index.html`, `styles.css`, `app.js`: the app
- `firebase-config.js`: Firebase project settings (public values)
- `sw.js`, `manifest.webmanifest`: home-screen app and offline support
- `img/`: family pictures and app icons

Add `?demo` to the address to try the app with sample storage on one device only.
