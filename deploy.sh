#!/bin/bash

# CoachGG Waitlist Deployment Script
# This script helps deploy the waitlist to various platforms

echo "🎮 CoachGG Waitlist Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the waitlist directory"
    exit 1
fi

# Function to deploy to static hosting
deploy_static() {
    echo "📦 Preparing static deployment..."
    
    # Create deployment directory
    mkdir -p dist
    
    # Copy static files
    cp index.html dist/
    cp styles.css dist/
    cp script.js dist/
    cp -r resources dist/ 2>/dev/null || echo "⚠️  No resources directory found"
    cp -r ../logo dist/ 2>/dev/null || echo "⚠️  No logo directory found"
    
    echo "✅ Static files prepared in ./dist/"
    echo "📤 Upload the ./dist/ folder to your static hosting provider"
    echo ""
    echo "Popular static hosting options:"
    echo "- Netlify: https://netlify.com"
    echo "- Vercel: https://vercel.com"
    echo "- GitHub Pages: https://pages.github.com"
    echo "- Surge: https://surge.sh"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "🚀 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not found. Please install it first:"
        echo "   https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        echo "📝 Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    # Create Heroku app
    read -p "Enter your Heroku app name (or press Enter for auto-generated): " app_name
    
    if [ -z "$app_name" ]; then
        heroku create
    else
        heroku create "$app_name"
    fi
    
    # Set environment variables
    read -s -p "Enter admin password: " admin_password
    echo ""
    heroku config:set ADMIN_PASSWORD="$admin_password"
    heroku config:set NODE_ENV=production
    
    # Deploy
    git add .
    git commit -m "Deploy to Heroku" --allow-empty
    git push heroku main
    
    echo "✅ Deployed to Heroku!"
    heroku open
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Login and deploy
    railway login
    railway init
    
    # Set environment variables
    read -s -p "Enter admin password: " admin_password
    echo ""
    railway variables set ADMIN_PASSWORD="$admin_password"
    railway variables set NODE_ENV=production
    
    # Deploy
    railway up
    
    echo "✅ Deployed to Railway!"
}

# Function to setup local development
setup_local() {
    echo "💻 Setting up local development..."
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env file..."
        cp .env.example .env
        echo "⚠️  Please edit .env file and set your ADMIN_PASSWORD"
    fi
    
    echo "✅ Local setup complete!"
    echo "🚀 Run 'npm start' to start the server"
    echo "🌐 Access at http://localhost:3001"
}

# Main menu
echo "Choose deployment option:"
echo "1) Static hosting (Netlify, Vercel, etc.)"
echo "2) Heroku"
echo "3) Railway"
echo "4) Setup local development"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_static
        ;;
    2)
        deploy_heroku
        ;;
    3)
        deploy_railway
        ;;
    4)
        setup_local
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo "📊 Don't forget to:"
echo "   - Set up analytics tracking"
echo "   - Configure your domain"
echo "   - Test the waitlist functionality"
echo "   - Monitor signups and performance"