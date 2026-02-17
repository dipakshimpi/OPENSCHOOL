import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth;

export function getAdminAuth() {
    if (adminAuth) return adminAuth;

    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            console.error("Firebase Admin Init Failed: Missing variables", { projectId, clientEmail, privateKeyPresent: !!privateKey });
            throw new Error("Missing Firebase Admin environment variables");
        }

        // Handle potential quoting issues from .env handling (Coolify/Docker sometimes retains them)
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }

        // Handle escaped newlines
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        console.log("Initializing Firebase Admin with project:", projectId);

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }

    adminAuth = admin.auth();
    return adminAuth;
}
