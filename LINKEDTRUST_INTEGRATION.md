# LinkedTrust Integration Update

## Overview
The portable-skill-credentials app now uses the simplified redirect flow for claiming credentials on LinkedTrust.

## How It Works

1. **User creates/imports a credential** in the portable-skill-credentials app
2. **User clicks "Share with LinkedTrust"**
3. **App submits credential** to LinkedTrust backend (`/api/credentials`)
4. **Backend returns**:
   - `uri`: The credential's unique identifier
   - `claimUrl`: Direct link to claim the credential
   - `message`: Status message
5. **App opens claim URL** in a new tab
6. **User logs in** to LinkedTrust (if not already)
7. **User claims credential** with a personalized statement

## Configuration

Add these environment variables to your `.env` file:

```env
# LinkedTrust API Configuration
NEXT_PUBLIC_LINKEDTRUST_API_URL=https://linkedtrust.us
NEXT_PUBLIC_LINKEDTRUST_URL=https://linkedtrust.us
```

For development/testing:
```env
NEXT_PUBLIC_LINKEDTRUST_API_URL=https://dev.linkedtrust.us
NEXT_PUBLIC_LINKEDTRUST_URL=https://dev.linkedtrust.us
```

## Benefits

- **No magic links or tokens** - Just a simple redirect
- **Handles existing credentials** - Shows claim URL even if credential exists
- **User-friendly flow** - Clear success messages and automatic tab opening
- **Flexible deployment** - Easy to switch between dev/prod environments

## Technical Details

### Frontend Changes
- `LinkedTrustUtils.ts`: Updated to use claim URL from response
- Removed complex magic link authentication flow
- Added proper handling for existing credentials (409 status)
- Environment-based API URL configuration

### Backend Behavior
- Returns `claimUrl` for all successful credential submissions
- Same response structure for new and existing credentials
- No special tokens or verification needed
- Standard OAuth/DID authentication on the claim page

## Migration Notes

If upgrading from the old magic link system:
1. Update environment variables
2. No database changes required
3. Old magic link code remains as fallback (can be removed later)
