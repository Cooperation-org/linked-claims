# LinkedTrust Credential Flow - Developer Guide

## Overview
We use a **simple redirect flow** for claiming credentials. No magic links, no special tokens - just store the credential and redirect the user to claim it.

## Core Principles
1. **Credentials are just URIs** - We store credentials as objects that can be referenced by URI
2. **User-driven claiming** - Users decide when and how to claim credentials, with personalized statements
3. **Schema-aware** - Different credential types (OpenBadges, Blockcerts, etc.) get appropriate handling
4. **Simple redirects** - After storing a credential, we just redirect to a claim page

## The Flow

### 1. Publishing a Credential
**From:** portable-skill-credentials (or any app)  
**To:** `POST /api/credentials`  
**Payload:**
```json
{
  "@context": "...",
  "type": ["VerifiableCredential", "OpenBadgeCredential"],
  "issuer": {...},
  "credentialSubject": {
    "achievement": {...}
  }
}
```

**Response:**
```json
{
  "credential": {...},
  "uri": "urn:credential:abc123",
  "schema": "OpenBadges",
  "claimUrl": "https://linkedtrust.us/claim-credential?uri=urn:credential:abc123&schema=OpenBadges"
}
```

### 2. Claiming the Credential
**User visits:** `/claim-credential?uri=X&schema=Y`

**Frontend:**
1. Fetches credential details: `GET /api/credentials/{uri}`
2. Generates schema-aware default statement (e.g., "Earned Web Development from FreeCodeCamp")
3. User can edit the statement
4. Creates a HAS claim: `POST /api/claims`

**Claim payload:**
```json
{
  "subject": "did:pkh:eip155:1:0x123...",  // User's identity
  "claim": "HAS",
  "object": "urn:credential:abc123",       // The credential URI
  "statement": "Earned Web Development Certificate from FreeCodeCamp. Demonstrated skills in React and Node.js",
  "howKnown": "VERIFIED_LOGIN",
  "confidence": 1.0
}
```

## Key Endpoints

### Backend (trust_claim_backend)
- `POST /api/credentials` - Submit/store a credential
- `GET /api/credentials/{uri}` - Get credential details
- `POST /api/claims` - Create a claim (existing endpoint)

### Frontend Routes
- `/claim-credential?uri={uri}&schema={schema}` - Claim page

## What Changed

### In portable-skill-credentials:
- Updated `LinkedTrustUtils.ts` to use the claimUrl from response
- Fixed endpoint from `/api/credential` to `/api/credentials`
- Added environment variables for API URLs

### In trust_claim_backend:
- Credentials endpoint returns `claimUrl` with schema parameter
- No special tokens or claim verification
- Schema detection already existed, we just pass it along

### In trust_claim frontend:
- `ClaimCredential` component reads schema from URL
- Uses `generateCredentialStatement()` for schema-aware statements
- Different messages for different credential types

## Important Notes

1. **No magic links** - The claimUrl is just a regular URL with parameters
2. **No special tables** - We removed the CredentialClaim migration, not needed
3. **Authentication required** - User must log in before claiming
4. **Dual signing** - Claims are signed by server (OAuth users) or client (DID users)

## Testing Checklist
- [ ] Submit credential via API, verify claimUrl includes schema
- [ ] Visit claim page while logged out → redirects to login
- [ ] OpenBadges credentials show achievement-specific statement
- [ ] Generic credentials show fallback statement
- [ ] User can edit statement before claiming
- [ ] After claiming, credential appears in user's profile

## Deployment Notes
- Update environment variables in portable-skill-credentials
- No database migrations needed
- Frontend and backend can be deployed independently

The key insight: **It's just a redirect with the credential URI**. Everything else uses existing infrastructure.
