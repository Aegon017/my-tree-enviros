import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = (() => {
    if (!firebaseConfig.projectId) {
        console.warn("Firebase projectId is missing. Firebase features will be disabled.");
        return null;
    }
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
})();

export const getFirebaseMessaging = async () => {
    if (!app) return null;
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};

export { app };
