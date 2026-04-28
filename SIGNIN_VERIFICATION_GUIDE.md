# LifeLine+ Authentication Flow with User Verification

## 📋 New Authentication Features

### 1. **Sign-Up Flow**
- User must create an account first
- Account data saved to Firestore
- `signinCount` initialized to 1
- `lastSigninAt` timestamp recorded

### 2. **Sign-In Verification**
- Check if user exists in Firestore
- If user exists: increment `signinCount` and allow login
- If user doesn't exist: show error and direct to sign-up
- Works for both email and Google sign-in

### 3. **Sign-In Count Tracking**
- Each successful sign-in increments `signinCount`
- `lastSigninAt` updated with current timestamp
- Useful for analytics and user engagement tracking

## 🚀 Complete Authentication Flow

### User First-Time Signup
1. User clicks "Sign In" → LoginModal opens
2. User clicks "Create Account" → Redirected to `/signup`
3. User fills signup form and submits
4. Account created with:
   - All user data stored
   - `signinCount: 1`
   - `lastSigninAt: <current timestamp>`
   - `status: active`
5. User automatically signed in
6. Redirected to home page

### User Sign-In (Return User)
1. User clicks "Sign In" → LoginModal opens
2. User enters name and email (or chooses Google)
3. Backend checks if user exists:
   ```
   POST /api/auth/check-email
   - Searches for email in Firestore
   - Returns { exists: true/false }
   ```
4. If NOT found:
   - Shows error: "Account not found. Please create an account first."
   - Shows link: "Go to Sign Up →"
   - User clicks link to signup page
5. If FOUND:
   - Backend increments signin count
   ```
   POST /api/auth/signin
   - Verifies user exists
   - Increments signinCount by 1
   - Updates lastSigninAt
   - Returns updated user data
   ```
6. User logged in successfully
7. Modal closes, user on home page

## 🔧 Backend API Endpoints

### Check if User Exists
```
POST /api/auth/check-email

Request:
{
  "email": "user@example.com"
}

Response (User Exists):
{
  "success": true,
  "exists": true,
  "message": "User exists. You can sign in.",
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com",
    "provider": "email",
    "signinCount": 5
  }
}

Response (User Not Found):
{
  "success": false,
  "exists": false,
  "message": "User does not exist. Please sign up first.",
  "email": "user@example.com"
}
```

### Sign In User
```
POST /api/auth/signin

Request:
{
  "email": "user@example.com"
  // OR
  "userId": "user-123"
}

Response:
{
  "success": true,
  "message": "Sign-in successful",
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "provider": "email",
    "photoURL": "",
    "signinCount": 6,
    "lastSigninAt": "2026-04-28T15:30:00.000Z"
  }
}

Error Response:
{
  "success": false,
  "message": "User not found. Please sign up first.",
  "error": "USER_NOT_FOUND"
}
```

### Sign Up User
```
POST /api/auth/signup

Request:
{
  "id": "user-123456",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": "123 Main St, City, State 12345",
  "provider": "email",
  "createdAt": "2026-04-28T12:00:00Z",
  "updatedAt": "2026-04-28T12:00:00Z",
  "signinCount": 1,
  "lastSigninAt": "2026-04-28T12:00:00Z",
  "status": "active"
}

Response:
{
  "success": true,
  "message": "User data saved successfully",
  "user": {
    "id": "user-123456",
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

## 📊 Firestore Data Structure

### User Document Example
```json
{
  "id": "user-1704067200000",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": "123 Main St, City, State 12345",
  "provider": "email",
  "photoURL": "",
  "createdAt": "2026-04-28T12:00:00Z",
  "updatedAt": "2026-04-28T15:30:00Z",
  "signinCount": 5,
  "lastSigninAt": "2026-04-28T15:30:00Z",
  "status": "active"
}
```

## 🧪 Testing the New Flow

### Test 1: Sign Up (New User)
1. Open http://localhost:5173
2. Click "Sign In" button
3. Click "Create Account"
4. Fill form:
   - Name: Test User
   - Email: testuser@example.com
   - Phone: 9876543210
   - Address: 123 Test Street
   - Password: password123
   - Confirm: password123
   - Agree to terms: ✓
5. Click "Create Account"
6. **Expected:** Account created, user logged in, redirected to home
7. **Console:** Should see `✅ [Signup] Account created and signed in successfully`
8. **Firestore:** Check `users` collection → document with `signinCount: 1`

### Test 2: Sign In (Existing User)
1. Go to http://localhost:5173
2. Click "Sign In" button
3. Enter name: Test User
4. Enter email: testuser@example.com (from Test 1)
5. Click "Continue as Guest"
6. **Expected:** User signed in successfully
7. **Console:** Should see:
   ```
   🔐 [Email Sign-in] Checking if user exists...
   ✅ User exists, processing sign-in...
   ✅ Sign-in successful, signin count: 2
   ```
8. **Firestore:** Check user document → `signinCount: 2`

### Test 3: Sign In (Non-Existent User)
1. Go to http://localhost:5173
2. Click "Sign In" button
3. Enter name: Fake User
4. Enter email: nonexistent@example.com
5. Click "Continue as Guest"
6. **Expected:** Error message appears:
   ```
   "Account not found. Please create an account first."
   "Go to Sign Up →"
   ```
7. **Console:** Should see `❌ User does not exist, must sign up first`
8. Click "Go to Sign Up →" link
9. **Expected:** Redirected to `/signup` page

### Test 4: Google Sign-Up (New Google User)
1. Go to http://localhost:5173
2. Click "Sign In" button
3. Click "Continue with Google"
4. Select a Google account
5. If first time with that Google email:
   - **Expected:** Error: "Account not found. Please create an account first..."
   - Click "Go to Sign Up →"
6. Go to signup page
7. Fill form with Google account data
8. Submit signup
9. **Expected:** Account created with Google as provider
10. **Firestore:** Check user document → `provider: google`, `signinCount: 1`

### Test 5: Google Sign-In (Return Google User)
1. Go to http://localhost:5173
2. Click "Sign In" button
3. Click "Continue with Google"
4. Select the same Google account from Test 4
5. **Expected:** User signed in successfully
6. **Console:** Should see:
   ```
   ✅ [Google Sign-in] User exists, processing sign-in...
   ✅ Google sign-in successful, signin count: 2
   ```
7. **Firestore:** Check user document → `signinCount: 2`

## 📈 Analytics & Sign-In Tracking

### Track User Engagement
```javascript
// Example: Get user's signin history
const userData = await getDocument('users', userId)
console.log(`User ${userData.name} has signed in ${userData.signinCount} times`)
console.log(`Last sign-in: ${userData.lastSigninAt}`)
```

### Use Cases
- Track active users
- Send "we miss you" emails to inactive users
- Show user statistics in dashboard
- Identify returning vs new users
- Analyze user engagement patterns

## 🔐 Security Features

✅ **User Verification** - Users must exist before signing in
✅ **Account Creation Required** - Can't skip the signup process
✅ **Sign-In Count Tracking** - Detects account abuse patterns
✅ **Last Sign-In Timestamp** - Tracks user activity
✅ **Provider Tracking** - Records auth method (email/google)
✅ **Status Field** - Can mark accounts as inactive if needed

## 🚨 Error Messages & Guidance

| Scenario | Message | Action |
|----------|---------|--------|
| Email doesn't exist | "Account not found. Please create an account first." | Click "Go to Sign Up" |
| Google account not registered | "Account not found. Please create an account first using your Google email." | Complete signup with Google |
| Firebase unavailable | "Failed to check user" | Try again later |
| Signup form invalid | Shows field-specific errors | Fix and resubmit |

## ✅ Implementation Checklist

- [x] Backend `/api/auth/check-email` endpoint
- [x] Backend `/api/auth/signin` endpoint
- [x] Frontend LoginModal with user verification
- [x] Signup page with signin count initialization
- [x] Firebase Firestore with user document structure
- [x] Console logging for debugging
- [x] Error handling and user feedback
- [x] Link to signup from login error
- [x] Increment signin count on login
- [x] Track lastSigninAt timestamp

---

**Status:** ✅ Complete - User verification and sign-in count tracking implemented!
