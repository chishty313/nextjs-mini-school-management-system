# Network Error Troubleshooting Guide

## Issue: "Network Error" when trying to login after deployment

### Root Cause

The backend CORS configuration was only allowing localhost origins, blocking requests from the deployed frontend.

### Solution Applied

1. **Backend CORS Configuration Fixed**
   - Added `https://nextjs-mini-school-management-syste.vercel.app` to allowed origins
   - Committed and pushed changes to trigger backend redeployment

### Verification Steps

#### 1. Check Backend Deployment

Wait 2-3 minutes for Vercel to redeploy the backend, then test:

```bash
curl -X GET https://mini-school-api.vercel.app/health
```

Expected response: `{"status":"ok","message":"API is running"}`

#### 2. Check Frontend API Configuration

Verify the frontend is using the correct API URL:

- Environment variable: `NEXT_PUBLIC_API_URL=https://mini-school-api.vercel.app`
- Should be set in Vercel dashboard under Environment Variables

#### 3. Test API Endpoints

```bash
# Test health endpoint
curl -X GET https://mini-school-api.vercel.app/health

# Test login endpoint (should return CORS error if not configured)
curl -X POST https://mini-school-api.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

#### 4. Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check for:
   - CORS errors in console
   - Failed requests (red status)
   - Response headers

### Common Issues & Solutions

#### Issue 1: CORS Error

**Error**: `Access to fetch at 'https://mini-school-api.vercel.app/auth/login' from origin 'https://nextjs-mini-school-management-syste.vercel.app' has been blocked by CORS policy`

**Solution**: Backend CORS configuration has been updated. Wait for redeployment.

#### Issue 2: 404 Not Found

**Error**: `GET https://mini-school-api.vercel.app/auth/login 404 (Not Found)`

**Solution**: Check if backend is deployed correctly:

```bash
curl -X GET https://mini-school-api.vercel.app/
```

#### Issue 3: 500 Internal Server Error

**Error**: `POST https://mini-school-api.vercel.app/auth/login 500 (Internal Server Error)`

**Solution**: Check backend environment variables in Vercel dashboard.

#### Issue 4: SSL/TLS Issues

**Error**: `ERR_SSL_PROTOCOL_ERROR` or similar

**Solution**: Ensure both frontend and backend are using HTTPS URLs.

### Environment Variables Checklist

#### Backend (Vercel Dashboard)

- [ ] `FRONTEND_URL=https://nextjs-mini-school-management-syste.vercel.app`
- [ ] `DB_HOST=ep-holy-dream-a1rqc1pt-pooler.ap-southeast-1.aws.neon.tech`
- [ ] `DB_NAME=neondb`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DB_PORT=5432`
- [ ] `DB_USER=neondb_owner`
- [ ] `DB_PASSWORD=npg_krY4v5dfBVbO`
- [ ] `JWT_ACCESS_SECRET=5776d435b61ca1c4b23133422c07feb22af1f7dd77e107b9b6c452b7c736934bfd1096b2adac7878b0dcb25639215ba88e08a5855a2997a0f521e0e07391e69c`
- [ ] `JWT_REFRESH_SECRET=1278f0ffdf6ea6e2bc60c45a1fddae3b7119fdb7a07153031a3311741c3df3d0fdd622e3bd6941b0581cdc72d7aa77643e64065750c60877c36a35492d48c55a`
- [ ] `JWT_ACCESS_EXPIRES_IN=1h`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`

#### Frontend (Vercel Dashboard)

- [ ] `NEXT_PUBLIC_API_URL=https://mini-school-api.vercel.app`

### Testing Steps

1. **Wait for Backend Redeployment** (2-3 minutes)
2. **Clear Browser Cache** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Test Login** with existing credentials
4. **Check Browser Console** for any remaining errors

### If Issues Persist

1. **Check Vercel Function Logs**:

   - Go to Vercel Dashboard
   - Select backend project
   - Go to Functions tab
   - Check for error logs

2. **Test with curl**:

   ```bash
   curl -X POST https://mini-school-api.vercel.app/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@school.edu","password":"AdminPass123!"}'
   ```

3. **Check Database Connection**:
   - Verify Neon database is accessible
   - Check if environment variables are correct

### Success Indicators

- ✅ Backend health endpoint returns 200
- ✅ Login request returns 200 with tokens
- ✅ No CORS errors in browser console
- ✅ Frontend successfully redirects after login
