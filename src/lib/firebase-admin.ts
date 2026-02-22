import * as admin from 'firebase-admin';

// Lazy initialization — only calls initializeApp() on first actual request,
// not at module evaluation time (which breaks Next.js build static analysis).
let _adminDb: admin.firestore.Firestore | null = null;
let _adminAuth: admin.auth.Auth | null = null;

function getAdminApp() {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('[Firebase Admin] Initialization error:', error);
            throw error;
        }
    }
    return admin.app();
}

export function getAdminDb(): admin.firestore.Firestore {
    if (!_adminDb) {
        _adminDb = getAdminApp().firestore();
    }
    return _adminDb;
}

export function getAdminAuth(): admin.auth.Auth {
    if (!_adminAuth) {
        _adminAuth = getAdminApp().auth();
    }
    return _adminAuth;
}

// Keep named exports for backward compatibility
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
    get(_, prop) {
        return (getAdminDb() as any)[prop];
    }
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
    get(_, prop) {
        return (getAdminAuth() as any)[prop];
    }
});
