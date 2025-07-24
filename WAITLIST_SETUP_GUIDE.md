# 🎮 CoachGG Waitlist - Complete Setup Guide

This guide will walk you through every step to make your CoachGG waitlist fully functional, from basic setup to production deployment.

## 📋 Table of Contents

1. [Quick Start (Static Version)](#quick-start-static-version)
2. [Full Backend Setup](#full-backend-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing the Waitlist](#testing-the-waitlist)
5. [Data Management](#data-management)
6. [Deployment Options](#deployment-options)
7. [Analytics & Monitoring](#analytics--monitoring)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (Static Version)

**Perfect for testing and simple deployments**

### Step 1: Basic Setup
```bash
# Navigate to the waitlist folder
cd docs/waitlist

# Open the landing page in your browser
open index.html
```

### Step 2: How It Works (Static)
- ✅ Waitlist data is stored in browser's localStorage
- ✅ No backend required
- ✅ Works immediately
- ⚠️ Data is local to each user's browser
- ⚠️ No centralized data collection

### Step 3: View Stored Data
Open browser console and run:
```javascript
// View all waitlist signups
coachggAdmin.getWaitlistData()

// Get current count
coachggAdmin.getWaitlistCount()

// Export data as CSV
coachggAdmin.exportData()
```

---

## 🖥️ Full Backend Setup

**Recommended for production use**

### Step 1: Install Dependencies
```bash
# Navigate to waitlist folder
cd docs/waitlist

# Install Node.js dependencies
npm install
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Admin Access (CHANGE THIS!)
ADMIN_PASSWORD=your-super-secure-password-here

# Optional: Database URL (if using external database)
# DATABASE_URL=postgresql://username:password@localhost:5432/coachgg_waitlist
```

### Step 3: Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### Step 4: Verify Backend is Running
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

---

## ⚙️ Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |
| `ADMIN_PASSWORD` | Admin access password | `MySecurePassword123!` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | External database | `postgresql://...` |
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password | `your-app-password` |

### Security Best Practices
```bash
# Generate a secure admin password
openssl rand -base64 32

# Set proper file permissions
chmod 600 .env

# Never commit .env to version control
echo ".env" >> .gitignore
```

---

## 🧪 Testing the Waitlist

### Step 1: Test Form Submission
1. Open the landing page: `http://localhost:3001`
2. Scroll to the waitlist form
3. Fill in:
   - ✅ Valid email address
   - ✅ Gamertag (optional)
   - ✅ Primary game (optional)
   - ✅ Check consent checkbox
4. Click "Join the Waitlist"

### Step 2: Verify Data Storage

**Backend Version:**
```bash
# Check waitlist count
curl http://localhost:3001/api/waitlist/count

# View admin stats (requires password)
curl "http://localhost:3001/api/admin/stats?password=YOUR_PASSWORD"
```

**Static Version:**
```javascript
// In browser console
coachggAdmin.getWaitlistData()
```

### Step 3: Test Error Handling
- Try submitting without email ❌
- Try submitting without consent ❌
- Try submitting same email twice ❌
- Try submitting invalid email format ❌

### Step 4: Test Rate Limiting (Backend Only)
```bash
# Send multiple requests quickly (should get rate limited)
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/waitlist/join \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","consent":true}'
done
```

---

## 📊 Data Management

### Viewing Waitlist Data

**Backend - Admin Dashboard:**
```bash
# Get detailed statistics
curl "http://localhost:3001/api/admin/stats?password=YOUR_PASSWORD"

# Export data (returns JSON)
curl "http://localhost:3001/api/admin/export?password=YOUR_PASSWORD"
```

**Static - Browser Console:**
```javascript
// View all data
coachggAdmin.getWaitlistData()

// Export as CSV
coachggAdmin.exportData()

// Clear all data (careful!)
coachggAdmin.clearWaitlist()
```

### Data Structure

Each waitlist entry contains:
```json
{
  "id": "unique-uuid",
  "emailHash": "sha256-hash",
  "email": "user@example.com",
  "gamertag": "PlayerName",
  "primaryGame": "valorant",
  "timestamp": "2024-12-XX...",
  "ipAddress": "xxx.xxx.xxx.xxx",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://...",
  "consentGiven": true,
  "consentTimestamp": "2024-12-XX..."
}
```

### Privacy Compliance (Alberta PIPA)
- ✅ Email addresses are hashed for duplicate detection
- ✅ Clear consent mechanism
- ✅ Privacy policy displayed
- ✅ User rights explained
- ✅ Data usage transparency

---

## 🚀 Deployment Options

### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

**Preparation:**
```bash
# Run the deployment script
./deploy.sh

# Choose option 1 (Static hosting)
# Files will be prepared in ./dist/ folder
```

**Manual Steps:**
1. Upload `dist/` folder contents to your hosting provider
2. Set `index.html` as the main page
3. Configure redirects if needed

**Netlify Example:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Option 2: Heroku Deployment

**Using Deploy Script:**
```bash
./deploy.sh
# Choose option 2 (Heroku)
# Follow the prompts
```

**Manual Steps:**
```bash
# Install Heroku CLI first
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set ADMIN_PASSWORD="your-secure-password"
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy CoachGG waitlist"
git push heroku main

# Open your app
heroku open
```

### Option 3: Railway Deployment

**Using Deploy Script:**
```bash
./deploy.sh
# Choose option 3 (Railway)
```

**Manual Steps:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Set environment variables
railway variables set ADMIN_PASSWORD="your-secure-password"
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Option 4: DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in dashboard:
   - `ADMIN_PASSWORD`
   - `NODE_ENV=production`
3. Deploy with automatic builds

---

## 📈 Analytics & Monitoring

### Built-in Analytics

The waitlist tracks:
- ✅ Signup timestamps
- ✅ Referrer sources
- ✅ Primary game preferences
- ✅ Geographic data (IP-based)
- ✅ User agent information

### Adding Google Analytics

Add to `script.js`:
```javascript
// Add after successful signup
gtag('event', 'waitlist_signup', {
  'game': entry.primaryGame,
  'has_gamertag': !!entry.gamertag,
  'referrer': entry.referrer
});
```

### Adding Mixpanel

Add to `script.js`:
```javascript
// Add after successful signup
mixpanel.track('Waitlist Signup', {
  'Primary Game': entry.primaryGame,
  'Has Gamertag': !!entry.gamertag,
  'Referrer': entry.referrer
});
```

### Monitoring Dashboard

Create a simple monitoring script:
```bash
#!/bin/bash
# monitor.sh

while true; do
  COUNT=$(curl -s "http://your-domain.com/api/waitlist/count" | jq '.count')
  echo "$(date): Waitlist count: $COUNT"
  sleep 300  # Check every 5 minutes
done
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Backend not available" message
**Symptoms:** Page shows "Using client-side storage"
**Solutions:**
```bash
# Check if server is running
curl http://localhost:3001/api/health

# Check server logs
npm start

# Verify port is correct in script.js
# Look for API_BASE_URL configuration
```

#### 2. Form submission fails
**Symptoms:** Error messages on form submit
**Solutions:**
```bash
# Check browser console for errors
# Verify CORS settings in backend
# Check rate limiting (wait 15 minutes)
# Verify email format is valid
```

#### 3. Admin endpoints return 401
**Symptoms:** "Unauthorized" when accessing admin features
**Solutions:**
```bash
# Verify ADMIN_PASSWORD is set correctly
echo $ADMIN_PASSWORD

# Check URL format
curl "http://localhost:3001/api/admin/stats?password=YOUR_ACTUAL_PASSWORD"
```

#### 4. Floating images not showing
**Symptoms:** Missing screenshots in hero section
**Solutions:**
```bash
# Verify image files exist
ls -la docs/waitlist/resources/

# Check browser console for 404 errors
# Verify image paths in HTML are correct
```

### Debug Mode

Enable debug logging:
```javascript
// Add to script.js
localStorage.setItem('debug', 'true');

// View debug logs in console
```

### Performance Issues

**Large image files:**
```bash
# Optimize images
# Install imagemin-cli
npm install -g imagemin-cli

# Compress images
imagemin resources/*.png --out-dir=resources/optimized
```

**Slow loading:**
```bash
# Enable gzip compression (add to server.js)
app.use(compression());

# Add caching headers
app.use(express.static('public', {
  maxAge: '1d'
}));
```

---

## 📞 Support & Next Steps

### Getting Help

1. **Check the logs:**
   ```bash
   # Backend logs
   npm start
   
   # Browser console
   F12 → Console tab
   ```

2. **Test API endpoints:**
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   
   # Waitlist count
   curl http://localhost:3001/api/waitlist/count
   ```

3. **Verify environment:**
   ```bash
   # Check Node.js version (should be 16+)
   node --version
   
   # Check npm version
   npm --version
   ```

### Advanced Features

Once your basic waitlist is working, consider adding:

- 📧 **Email notifications** for new signups
- 🔄 **Real-time updates** with WebSockets
- 📊 **Advanced analytics** dashboard
- 🎯 **A/B testing** for conversion optimization
- 🔐 **Enhanced security** with rate limiting
- 📱 **Mobile app** integration
- 🌍 **Internationalization** support

### Production Checklist

Before going live:

- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and alerts
- [ ] Test on multiple devices/browsers
- [ ] Verify privacy policy compliance
- [ ] Set up backup strategy
- [ ] Configure error logging
- [ ] Test rate limiting
- [ ] Verify email validation

---

## 🎉 Congratulations!

Your CoachGG waitlist is now fully functional! 🎮

**Quick Links:**
- 🌐 **Landing Page:** `http://localhost:3001`
- 📊 **Admin Stats:** `http://localhost:3001/api/admin/stats?password=YOUR_PASSWORD`
- 🔧 **Health Check:** `http://localhost:3001/api/health`

**Remember to:**
- Monitor signup rates
- Engage with your waitlist subscribers
- Prepare for launch based on demand
- Keep your privacy policy updated

Good luck with your CoachGG launch! 🚀