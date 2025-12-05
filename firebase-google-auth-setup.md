# Enable Google Sign-In for TaskFlow

Follow these steps to enable Google authentication in your Firebase project:

## Step 1: Enable Google Sign-In Method

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **task-management-system-9f068**
3. Click on **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Find **Google** in the list of providers
6. Click on **Google** to expand it
7. Toggle the **Enable** switch to ON
8. Enter your **Project support email** (your email address)
9. Click **Save**

## Step 2: Configure OAuth Consent Screen (if needed)

If you plan to deploy this app publicly:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Fill in the required information:
   - App name: **TaskFlow**
   - User support email: Your email
   - Developer contact information: Your email
5. Click **Save and Continue**

## Step 3: Test Google Sign-In

1. Run your server: `python server.py`
2. Visit: http://localhost:5000
3. Click "Login / Sign Up"
4. Click "Continue with Google"
5. Select your Google account
6. You should be redirected to the app page

## Troubleshooting

**Error: "This app is blocked"**
- Make sure Google sign-in is enabled in Firebase Console
- Check that your domain is authorized in Firebase settings

**Error: "Popup closed by user"**
- User closed the popup before completing sign-in
- This is normal behavior, just try again

**Error: "auth/popup-blocked"**
- Browser is blocking popups
- Allow popups for localhost in browser settings

## Security Notes

- Google Sign-In uses OAuth 2.0 for secure authentication
- User credentials are never stored in your app
- Firebase handles all authentication securely
- Users can revoke access anytime from their Google account settings

## Production Deployment

When deploying to production:

1. Add your production domain to Firebase authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your domain (e.g., taskflow.com)

2. Update OAuth consent screen with production URL

3. Consider adding privacy policy and terms of service links
