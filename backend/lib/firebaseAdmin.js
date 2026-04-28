import admin from 'firebase-admin';

let firebaseApp = null;
let firestore = null;
let initAttempted = false;

export function getFirebaseAdmin() {
  if (firebaseApp) {
    console.log('🔥 [Firebase Admin] Already initialized')
    return firebaseApp;
  }
  if (initAttempted) {
    console.warn('⚠️ [Firebase Admin] Init already attempted and failed')
    return null;
  }

  initAttempted = true;

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;
  
  console.log('🔧 [Firebase Admin] Initializing...')
  console.log(`  - Project ID: ${FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing'}`)
  console.log(`  - Private Key: ${FIREBASE_PRIVATE_KEY ? '✓ Set' : '✗ Missing'}`)
  console.log(`  - Client Email: ${FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing'}`)
  
  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    console.error('❌ [Firebase Admin] Missing required credentials')
    return null;
  }

  try {
    firebaseApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: FIREBASE_CLIENT_EMAIL
          })
        });
    console.log('✅ [Firebase Admin] Successfully initialized')
    return firebaseApp;
  } catch (error) {
    console.error('❌ [Firebase Admin] Initialization failed:', error.message);
    return null;
  }
}

export function getFirestore() {
  if (firestore) return firestore;
  const app = getFirebaseAdmin();
  if (!app) return null;
  firestore = admin.firestore();
  return firestore;
}

export async function saveDocument(collection, id, data) {
  const db = getFirestore();
  if (!db) {
    console.error('❌ [Firestore] Database not initialized')
    return false;
  }
  try {
    console.log(`📝 [Firestore] Saving to collection="${collection}" doc="${id}"`)
    await db.collection(collection).doc(id).set(data, { merge: true });
    console.log(`✅ [Firestore] Successfully saved to ${collection}/${id}`)
    return true;
  } catch (error) {
    console.error(`❌ [Firestore] Save failed for ${collection}/${id}:`, error.message);
    return false;
  }
}

export async function getDocument(collection, id) {
  const db = getFirestore();
  if (!db) return null;
  try {
    const snapshot = await db.collection(collection).doc(id).get();
    return snapshot.exists ? snapshot.data() : null;
  } catch (error) {
    console.warn(`Firestore read skipped for ${collection}/${id}:`, error.message);
    return null;
  }
}

export async function getUserByEmail(email) {
  const db = getFirestore();
  if (!db) {
    console.error('❌ [Firestore] Database not initialized')
    return null;
  }
  try {
    console.log(`🔍 [Firestore] Searching for user with email: ${email}`)
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      console.log(`❌ [Firestore] No user found with email: ${email}`)
      return null;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    console.log(`✅ [Firestore] User found with email: ${email}`)
    return { id: userDoc.id, ...userData };
  } catch (error) {
    console.error(`❌ [Firestore] Error searching for user by email:`, error.message);
    return null;
  }
}

export async function incrementSigninCount(userId) {
  const db = getFirestore();
  if (!db) {
    console.error('❌ [Firestore] Database not initialized')
    return false;
  }
  try {
    console.log(`📊 [Firestore] Incrementing signin count for user: ${userId}`)
    await db.collection('users').doc(userId).update({
      signinCount: admin.firestore.FieldValue.increment(1),
      lastSigninAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ [Firestore] Signin count incremented for user: ${userId}`)
    return true;
  } catch (error) {
    console.error(`❌ [Firestore] Error incrementing signin count:`, error.message);
    return false;
  }
}

export default admin;
