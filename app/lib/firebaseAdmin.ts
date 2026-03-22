import { initializeApp, cert, ServiceAccount, getApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
// Construct the ServiceAccount object
const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};
// Check if any Firebase apps have been initialized
let firebaseAdminApp;
if (!getApps().length) {
    firebaseAdminApp = initializeApp({
        credential: cert(serviceAccount),
    });
} else {
    firebaseAdminApp = getApp(); // Reuse the already initialized app
}
// Export Firebase Admin services
export const adminAuth = getAuth(firebaseAdminApp);