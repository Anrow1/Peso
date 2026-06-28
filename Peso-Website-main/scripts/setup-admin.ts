/**
 * Run this ONCE to create the PESO Admin account in Firebase.
 * Usage: npx tsx scripts/setup-admin.ts
 *
 * This creates:
 *   - Firebase Auth user: admin@peso.gov.ph / peso@admin2026
 *   - Firestore doc: admins/{uid}
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// NOTE: You need a service account key for admin SDK.
// Download from Firebase Console → Project Settings → Service accounts → Generate new private key
// Save as scripts/serviceAccountKey.json

import serviceAccount from './serviceAccountKey.json';

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
}

const auth = getAuth();
const db = getFirestore();

async function main() {
  const email = 'admin@peso.gov.ph';
  const password = 'peso@admin2026';

  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log('Admin user already exists:', user.uid);
    } catch {
      user = await auth.createUser({ email, password, displayName: 'PESO Admin' });
      console.log('Created admin user:', user.uid);
    }

    await db.collection('admins').doc(user.uid).set({
      email, displayName: 'PESO Administrator', status: 'active', createdAt: new Date().toISOString(),
    });
    console.log('✅ Admin Firestore doc set at admins/', user.uid);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

main();
