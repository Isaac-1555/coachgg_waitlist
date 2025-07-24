# CoachGG Landing Page & Waitlist

A beautiful, responsive landing page for CoachGG with a functional waitlist system that complies with Alberta's Personal Information Protection Act (PIPA).

## 🎯 Features

- **Beautiful Landing Page**: Modern design with neon gaming theme
- **Functional Waitlist**: Email collection with validation and duplicate prevention
- **Privacy Compliant**: Full compliance with Alberta PIPA regulations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Analytics**: Track signups and user engagement
- **Admin Dashboard**: Export data and view statistics
- **Rate Limiting**: Prevents spam and abuse
- **Data Security**: Hashed emails and secure data storage

## 🚀 Quick Start

### Option 1: Static Version (Client-side only)
Simply open `index.html` in a web browser. Data will be stored in localStorage.

### Option 2: Full Backend (Recommended for production)

1. **Install Dependencies**
   ```bash
   cd docs/waitlist
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   export ADMIN_PASSWORD="your-secure-admin-password"
   export PORT=3001
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Landing Page**
   - Landing Page: `http://localhost:3001`
   - Admin Stats: `http://localhost:3001/api/admin/stats?password=your-password`
   - Health Check: `http://localhost:3001/api/health`

## 📊 API Endpoints

### Public Endpoints
- `GET /` - Landing page
- `GET /api/waitlist/count` - Get current waitlist count
- `POST /api/waitlist/join` - Join the waitlist
- `GET /api/health` - Health check

### Admin Endpoints (Password Protected)
- `GET /api/admin/stats?password=XXX` - Get detailed statistics
- `GET /api/admin/export?password=XXX` - Export waitlist data

## 🔒 Privacy & Compliance

This landing page is designed to comply with Alberta's Personal Information Protection Act (PIPA):

### Data Collection
- **Email Address**: Required for waitlist notifications
- **Gamertag**: Optional, for personalization
- **Primary Game**: Optional, for market research
- **Technical Data**: IP address, browser info (for security)

### Privacy Features
- Clear consent mechanism with checkbox
- Detailed privacy policy modal
- Email hashing for duplicate detection
- Secure data storage
- Right to data deletion
- Transparent data usage

### User Rights
Users can:
- Access their personal information
- Request correction of inaccurate data
- Withdraw consent for marketing
- Request deletion of their data

## 🎨 Customization

### Colors & Theme
The design uses CSS custom properties for easy theming:

```css
:root {
    --color-background: #0D0D0D;
    --color-card-background: #1A1A1A;
    --color-neon-green: #39FF14;
    --color-neon-purple: #9B30FF;
    --color-primary-text: #FFFFFF;
    --color-secondary-text: #AAAAAA;
}
```

### Content
Edit the HTML file to customize:
- Hero section text
- Feature descriptions
- Pricing information
- Privacy policy details

## 📱 Responsive Design

The landing page is fully responsive with breakpoints at:
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: 320px - 767px

## 🔧 Development

### File Structure
```
docs/waitlist/
├── index.html              # Main landing page
├── styles.css              # All styling
├── script.js               # Frontend JavaScript
├── waitlist-backend.js     # Backend server
├── package.json            # Dependencies
├── README.md               # This file
└── resources/              # Screenshots and assets
    ├── Screenshot 2025-07-24 at 3.43.47 AM.png
    ├── Screenshot 2025-07-24 at 3.44.02 AM.png
    ├── Screenshot 2025-07-24 at 3.44.10 AM.png
    └── Screenshot 2025-07-24 at 3.44.20 AM.png
```

### Key Components

1. **Navigation**: Fixed header with smooth scrolling
2. **Hero Section**: Animated preview with floating cards
3. **Features Grid**: 6 key features with icons
4. **How It Works**: 3-step process visualization
5. **Pricing**: 3-tier pricing structure
6. **Waitlist Form**: Secure signup with validation
7. **Footer**: Links and legal information

### JavaScript Features

- Form validation and submission
- Real-time waitlist counter
- Smooth scrolling navigation
- Modal system for privacy/terms
- Notification system
- Mobile menu toggle
- Scroll animations
- Admin functions (console accessible)

## 🚀 Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)
1. Upload all files to your hosting platform
2. Set `index.html` as the main page
3. Configure redirects if needed

### Full Backend Deployment

#### Heroku
```bash
# Create Heroku app
heroku create coachgg-waitlist

# Set environment variables
heroku config:set ADMIN_PASSWORD=your-secure-password

# Deploy
git add .
git commit -m "Deploy CoachGG waitlist"
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy with automatic builds

## 📈 Analytics Integration

To add analytics tracking, integrate with your preferred service:

### Google Analytics
```javascript
// Add to script.js
gtag('event', 'waitlist_signup', {
    'game': entry.primaryGame,
    'has_gamertag': !!entry.gamertag
});
```

### Mixpanel
```javascript
// Add to script.js
mixpanel.track('Waitlist Signup', {
    'Primary Game': entry.primaryGame,
    'Has Gamertag': !!entry.gamertag
});
```

## 🔐 Security Considerations

### Production Checklist
- [ ] Set strong ADMIN_PASSWORD
- [ ] Use HTTPS in production
- [ ] Implement proper authentication for admin endpoints
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add input sanitization
- [ ] Set up monitoring and logging
- [ ] Review and update privacy policy

### Data Protection
- Emails are hashed for duplicate detection
- Sensitive data is not logged
- Rate limiting prevents abuse
- Input validation prevents injection attacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Email: support@coachgg.com
- Create an issue in the repository
- Check the documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for the esports community**