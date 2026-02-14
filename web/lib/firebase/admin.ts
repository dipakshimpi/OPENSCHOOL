import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth;

export function getAdminAuth() {
    if (adminAuth) return adminAuth;

    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            // During build time, if we don't have these, we return a mock or just throw
            // But since this is only called at runtime now, we should throw if missing.
            throw new Error("Missing Firebase Admin environment variables");
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
    }

    adminAuth = admin.auth();
    return adminAuth;
}
