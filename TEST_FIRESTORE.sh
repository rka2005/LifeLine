#!/bin/bash

# LifeLine+ Firestore Integration Testing Guide
# This guide helps verify that user data is being saved to Firebase Firestore

echo "=========================================="
echo "LifeLine+ Firestore Integration Test"
echo "=========================================="
echo ""

# Test 1: Check if backend is running
echo "✓ TEST 1: Checking Backend Connection..."
BACKEND_RESPONSE=$(curl -s http://localhost:5000/api/health)
if [[ $BACKEND_RESPONSE == *"OK"* ]]; then
    echo "✅ Backend is running on port 5000"
else
    echo "❌ Backend is not responding on port 5000"
    echo "   Start backend with: cd backend && npm start"
    exit 1
fi
echo ""

# Test 2: Check if frontend is running
echo "✓ TEST 2: Checking Frontend Connection..."
if nc -z localhost 5173 2>/dev/null; then
    echo "✅ Frontend is running on port 5173"
else
    echo "❌ Frontend is not running on port 5173"
    echo "   Start frontend with: cd frontend && npm run dev"
fi
echo ""

# Test 3: Test signup endpoint
echo "✓ TEST 3: Testing Signup Endpoint..."
TEST_USER="test-$(date +%s%N | cut -b1-13)"

SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$TEST_USER\",
    \"name\": \"Test User\",
    \"email\": \"test@example.com\",
    \"phone\": \"9876543210\",
    \"provider\": \"email\",
    \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

if [[ $SIGNUP_RESPONSE == *"success"* ]]; then
    echo "✅ Signup endpoint working"
    echo "   User ID: $TEST_USER"
    echo "   Response: $SIGNUP_RESPONSE"
else
    echo "❌ Signup endpoint failed"
    echo "   Response: $SIGNUP_RESPONSE"
fi
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
echo ""
echo "📝 Manual Testing Steps:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Click the sign-in button (top navigation)"
echo "3. Choose 'Create Account' to go to signup"
echo "4. Fill in the form and submit"
echo "5. Check browser console (F12) for logs:"
echo "   - Look for: '✅ User successfully saved to Firestore'"
echo ""
echo "📊 Check Firebase Console:"
echo "1. Go to https://console.firebase.google.com"
echo "2. Select your project: 'lifeline-ai-4984e'"
echo "3. Go to Firestore Database"
echo "4. Look for 'users' collection"
echo "5. You should see documents with user data"
echo ""
