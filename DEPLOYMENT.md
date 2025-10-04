# Frontend Deployment Guide

This guide will walk you through deploying the Mini School Management Frontend to Vercel.

## Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Backend API**: Deploy the backend API first (see backend repository)

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository

```bash
cd mini-school-frontend
git init
git add .
git commit -m "Initial commit: Mini School Management Frontend"
```

### 1.2 Create GitHub Repository

1. Go to GitHub and create a new repository named `mini-school-frontend`
2. Don't initialize with README (you already have one)
3. Copy the repository URL

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/yourusername/mini-school-frontend.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend API First

**Important**: You must deploy the backend API first to get the API URL for the frontend.

1. Follow the backend deployment guide
2. Note the backend API URL (e.g., `https://mini-school-api-abc123.vercel.app`)

## Step 3: Deploy to Vercel

### 3.1 Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `mini-school-frontend` repository

### 3.2 Configure Project

1. **Project Name**: `mini-school-frontend` (or your preferred name)
2. **Framework Preset**: Next.js (should be auto-detected)
3. **Root Directory**: `./` (leave as default)
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`
6. **Install Command**: `npm install`

### 3.3 Set Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```bash
# Backend API URL (from your backend deployment)
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app

# Environment
NODE_ENV=production
```

**Important**: Replace `https://your-backend-api.vercel.app` with your actual backend API URL from Step 2.

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note the deployment URL (e.g., `https://mini-school-frontend-xyz789.vercel.app`)

## Step 4: Update Backend CORS Configuration

After deploying the frontend, you need to update the backend CORS configuration:

### 4.1 Update Backend Environment Variables

1. Go to your backend project in Vercel
2. Go to Settings → Environment Variables
3. Add or update:
   ```
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

### 4.2 Redeploy Backend

1. Go to Deployments tab in your backend project
2. Click "Redeploy" on the latest deployment
3. This will update the CORS configuration

## Step 5: Test Your Deployment

### 5.1 Test Frontend

1. Visit your frontend URL
2. You should see the login page
3. Try registering a new account
4. Test the login functionality

### 5.2 Test Integration

1. Register a new user account
2. Login with the account
3. Navigate through different sections
4. Test all role-based features

### 5.3 Test Responsive Design

1. Test on different screen sizes
2. Verify mobile navigation works
3. Check that all components are responsive

## Environment Variables Reference

| Variable              | Description     | Example                                     |
| --------------------- | --------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://mini-school-api-abc123.vercel.app` |
| `NODE_ENV`            | Environment     | `production`                                |

## Custom Domain (Optional)

### 5.1 Add Custom Domain

1. Go to your frontend project in Vercel
2. Go to Settings → Domains
3. Add your custom domain (e.g., `app.yourschool.com`)

### 5.2 Update Backend CORS

After adding a custom domain, update the `FRONTEND_URL` in your backend project.

## Troubleshooting

### Common Issues

#### 1. Build Failures

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

#### 2. API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check that backend API is running
- Verify CORS configuration in backend

#### 3. Authentication Issues

- Check that JWT tokens are being set
- Verify cookie configuration
- Check browser console for errors

#### 4. Routing Issues

- Verify Next.js configuration
- Check that all pages are properly exported
- Verify dynamic routing

### Getting Help

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables
4. Test API endpoints directly
5. Check network tab for failed requests

## Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Backend API deployed
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Frontend deployed successfully
- [ ] Login page loads correctly
- [ ] User registration working
- [ ] User login working
- [ ] All dashboards accessible
- [ ] CORS configured in backend
- [ ] Responsive design working
- [ ] All features functional

## Performance Optimization

### Vercel Optimizations

- Automatic image optimization
- Edge functions
- Global CDN
- Automatic HTTPS

### Next.js Optimizations

- Code splitting
- Lazy loading
- Static generation where possible
- Bundle optimization

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor page views and performance
3. Track user interactions

### Error Tracking

Consider adding error tracking:

- Sentry
- LogRocket
- Bugsnag

## Next Steps

After successful deployment:

1. **Test All Features**: Verify all functionality works
2. **Monitor Performance**: Keep an eye on load times
3. **Set Up Monitoring**: Add error tracking and analytics
4. **Optimize**: Monitor and optimize performance
5. **Update**: Keep dependencies updated

Your frontend is now live! 🎉

## Frontend URL

Once deployed, your frontend will be available at:

- **Frontend URL**: `https://your-frontend-url.vercel.app`
- **Login Page**: `https://your-frontend-url.vercel.app/login`
- **Admin Dashboard**: `https://your-frontend-url.vercel.app/admin`
- **Teacher Dashboard**: `https://your-frontend-url.vercel.app/teacher`
- **Student Dashboard**: `https://your-frontend-url.vercel.app/student`
