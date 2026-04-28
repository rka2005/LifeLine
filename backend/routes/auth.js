import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { getFirebaseAdmin, saveDocument, getDocument, incrementSigninCount } from '../lib/firebaseAdmin.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Token (Failover Strategy: Google OAuth -> Firebase Auth)
router.post('/google', async (req, res) => {
  const { idToken, provider = 'google' } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'No ID token provided' });
  }

  try {
    let userData = null;
    let googleId = null;

    // Attempt 1: Verify as Pure Google OAuth Token
    try {
      console.log('🔐 [Auth] Attempting Pure Google verification...');
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      userData = {
        id: googleId,
        email: payload.email,
        name: payload.name,
        photoURL: payload.picture,
        provider: 'google_pure'
      };
    } catch (googleError) {
      // Attempt 2: Fallback to Firebase Token Verification
      console.log('🔄 [Auth] Pure Google failed, trying Firebase fallback...');
      const auth = getFirebaseAdmin().auth();
      const decodedToken = await auth.verifyIdToken(idToken);
      googleId = decodedToken.uid;
      userData = {
        id: googleId,
        email: decodedToken.email,
        name: decodedToken.name,
        photoURL: decodedToken.picture,
        provider: 'firebase_google'
      };
    }

    // Process user in Firestore
    const dbUser = await getDocument('users', googleId);
    userData.updatedAt = new Date().toISOString();

    if (!dbUser) {
      userData.createdAt = new Date().toISOString();
      userData.signinCount = 1;
      await saveDocument('users', googleId, userData);
    } else {
      await incrementSigninCount(googleId);
      await saveDocument('users', googleId, {
        name: userData.name,
        photoURL: userData.photoURL,
        updatedAt: userData.updatedAt
      });
      userData = { ...dbUser, ...userData };
    }

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('❌ [Auth Failover] All methods failed:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Legacy Sign Up (Email/Password)
router.post('/signup', async (req, res) => {
  try {
    const { id, name, email, phone, photo, provider, createdAt } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userData = {
      id,
      name: name || 'User',
      email,
      phone: phone || '',
      photo: photo || '',
      provider: provider || 'email',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    await saveDocument('users', id, userData);
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// Get user data
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getDocument('users', userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

export default router;
