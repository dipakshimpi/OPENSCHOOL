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

        // --- SUPER ROBUST PEM PARSER ---
        // 0. Base64 Decode Check (The "Nuclear Option")
        // If the key doesn't start with dashes, it might be Base64 encoded.
        if (!privateKey.includes('-----BEGIN') && !privateKey.includes('-----END')) {
            try {
                const decoded = Buffer.from(privateKey, 'base64').toString('utf8');
                if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
                    console.log("Detected Base64 encoded private key. Decoding...");
                    privateKey = decoded;
                }
            } catch (e) {
                console.warn("Failed to decode potential Base64 key");
            }
        }

        // 1. Clean up surrounding quotes and whitespace
        privateKey = privateKey.trim();
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
            privateKey = privateKey.slice(1, -1);
        }

        // 2. Fix newline escaping (literal \n -> actual newline)
        privateKey = privateKey.replace(/\\n/g, '\n');

        // 3. Ensure BEGIN/END headers are present (sometimes trimming clips them)
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey;
        }
        if (!privateKey.includes('-----END PRIVATE KEY-----')) {
            privateKey = privateKey + '\n-----END PRIVATE KEY-----';
        }

        console.log("Initializing Firebase Admin for project:", projectId);

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
