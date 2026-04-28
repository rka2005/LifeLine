import express from 'express';
import { saveDocument, getDocument, getUserByEmail, incrementSigninCount, getFirestore } from '../lib/firebaseAdmin.js';

const router = express.Router();

// Save user data to Firestore
router.post('/signup', async (req, res) => {
  try {
    console.log('\n📨 [/api/auth/signup] Received sign-up request')
    console.log('📦 Request body:', req.body)
    
    const { id, name, email, phone, photo, provider, createdAt } = req.body;

    // Validate required fields
    if (!id || !email) {
      console.error('❌ Validation error: Missing id or email')
      return res.status(400).json({ 
        error: 'Missing required fields: id and email are required' 
      });
    }

    // Prepare user data
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

    console.log('💾 Attempting to save to Firestore with data:', userData)
    
    // Save to Firestore using user ID as document ID
    const saved = await saveDocument('users', id, userData);

    if (!saved) {
      console.error('❌ Firestore save returned false for user:', id)
      return res.status(500).json({ 
        error: 'Failed to save user to Firestore',
        details: 'Database operation failed'
      });
    }

    console.log('✅ User successfully saved to Firestore:', id)
    res.status(200).json({
      success: true,
      message: 'User data saved successfully',
      user: userData
    });
  } catch (error) {
    console.error('❌ Auth signup error:', error)
    res.status(500).json({
      error: 'Failed to save user data',
      details: error.message
    });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Add update timestamp
    const userData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save updates to Firestore
    const saved = await saveDocument('users', userId, userData);

    if (!saved) {
      return res.status(500).json({ 
        error: 'Failed to update user profile',
        details: 'Database operation failed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Auth profile update error:', error);
    res.status(500).json({
      error: 'Failed to update user profile',
      details: error.message
    });
  }
});

// Get user data
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Fetch from Firestore
    const user = await getDocument('users', userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth get user error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user data',
      details: error.message
    });
  }
});

// Check if user exists by email
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    console.log('\n📨 [/api/auth/check-email] Checking if user exists...')
    console.log(`📧 Email: ${email}`)
    
    const user = await getUserByEmail(email);

    if (!user) {
      console.log(`❌ User not found for email: ${email}`)
      return res.status(200).json({
        success: false,
        exists: false,
        message: 'User does not exist. Please sign up first.',
        email
      });
    }

    console.log(`✅ User found for email: ${email}`)
    res.status(200).json({
      success: true,
      exists: true,
      message: 'User exists. You can sign in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        signinCount: user.signinCount || 0
      }
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      error: 'Failed to check user',
      details: error.message
    });
  }
});

// Sign in user and increment signin count
router.post('/signin', async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({ 
        error: 'User ID or Email is required' 
      });
    }

    console.log('\n📨 [/api/auth/signin] Processing sign-in...')
    
    let user = null;
    let docId = userId;

    // If email is provided, search by email
    if (email && !userId) {
      console.log(`🔍 Searching by email: ${email}`)
      user = await getUserByEmail(email);
      if (user) {
        docId = user.id;
      }
    } else if (userId) {
      // If userId is provided, fetch directly
      console.log(`🔍 Fetching by ID: ${userId}`)
      user = await getDocument('users', userId);
      docId = userId;
    }

    if (!user) {
      console.log(`❌ User not found for sign-in`)
      return res.status(401).json({
        success: false,
        message: 'User not found. Please sign up first.',
        error: 'USER_NOT_FOUND'
      });
    }

    // Increment signin count
    console.log(`📊 Incrementing signin count for user: ${docId}`)
    const updated = await incrementSigninCount(docId);

    if (!updated) {
      console.warn(`⚠️ Failed to increment signin count, but user exists`)
    }

    // Get updated user data
    const updatedUser = await getDocument('users', docId);

    console.log(`✅ User signed in successfully: ${docId}`)
    res.status(200).json({
      success: true,
      message: 'Sign-in successful',
      user: {
        id: updatedUser.id || docId,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        provider: updatedUser.provider,
        photoURL: updatedUser.photoURL || '',
        signinCount: updatedUser.signinCount || 1,
        lastSigninAt: updatedUser.lastSigninAt
      }
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({
      error: 'Failed to process sign-in',
      details: error.message
    });
  }
});

export default router;
