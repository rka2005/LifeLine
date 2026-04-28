import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { getFirebaseAdmin, saveDocument, getDocument, getUserByEmail, incrementSigninCount } from '../lib/firebaseAdmin.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function buildUserRecord(payload, existingUser = null) {
  const now = new Date().toISOString();
  const userId = existingUser?.id || payload.id || payload.email;

  return {
    id: userId,
    name: payload.name || existingUser?.name || 'User',
    email: payload.email,
    phone: payload.phone || existingUser?.phone || '',
    address: payload.address || existingUser?.address || '',
    provider: payload.provider || existingUser?.provider || 'email',
    photoURL: payload.photoURL || existingUser?.photoURL || '',
    createdAt: existingUser?.createdAt || payload.createdAt || now,
    updatedAt: now,
    signinCount: existingUser?.signinCount || payload.signinCount || 1,
    lastSigninAt: payload.lastSigninAt || existingUser?.lastSigninAt || now,
    status: existingUser?.status || payload.status || 'active'
  };
}

// Create or update a user record after signup
router.post('/signup', async (req, res) => {
  try {
    const payload = req.body || {};
    const { email } = payload;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const existingUser = await getUserByEmail(email);
    const userRecord = buildUserRecord(payload, existingUser);

    await saveDocument('users', userRecord.id, userRecord);

    res.status(existingUser ? 200 : 201).json({
      success: true,
      user: userRecord,
      created: !existingUser
    });
  } catch (error) {
    console.error('❌ [Signup] Failed to save user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      details: error.message
    });
  }
});

// Verify Token (Failover Strategy: Google OAuth -> Firebase Auth)
router.post('/google', async (req, res) => {
  const { idToken, provider = 'google' } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'No ID token provided' });
  }

  try {
    let userData = null;
    let googleId = null;

    // Attempt 1: Verify as Google ID Token (Firebase or Direct ID Token)
    try {
      console.log('🔐 [Auth] Attempting ID Token verification...');
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
        provider: 'google_id'
      };
    } catch (idTokenError) {
      // Attempt 2: Verify as Google Access Token (Direct Fallback)
      console.log('🔄 [Auth] ID Token failed, attempting Access Token verification...');
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${idToken}`);
        if (!response.ok) throw new Error('Invalid Access Token');
        
        const payload = await response.json();
        googleId = payload.sub;
        
        // Access token doesn't always have name/picture, so we fetch them if missing
        if (!payload.email) throw new Error('Token does not contain email');
        
        userData = {
          id: googleId,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          photoURL: payload.picture || '',
          provider: 'google_access'
        };
      } catch (accessTokenError) {
        // Attempt 3: Fallback to Firebase ID Token Verification
        console.log('🔄 [Auth] Access Token failed, trying Firebase fallback...');
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
    }

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

// Check if user exists by email
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(200).json({ success: false, exists: false });
    }

    res.status(200).json({ success: true, exists: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check user' });
  }
});

// Sign in/up user (Legacy/Email)
router.post('/signin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await incrementSigninCount(user.id);
    const updatedUser = await getDocument('users', user.id);
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Sign-in failed' });
  }
});

// Update Profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    await saveDocument('users', userId, { ...updates, updatedAt: new Date().toISOString() });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
