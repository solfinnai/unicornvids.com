#!/bin/bash
set -e

echo "🦄 UnicornVids Deploy Script"
echo "============================"
echo ""

# Navigate to the site folder
cd "$(dirname "$0")"

echo "📁 Initializing git repo..."
git init
git add -A
git commit -m "🦄 Initial launch — UnicornVids site"

echo ""
echo "🐙 Creating GitHub repo (unicornvids/unicornvids.com)..."
gh repo create unicornvids/unicornvids.com --public --source=. --remote=origin --push

echo ""
echo "✅ Pushed to GitHub!"
echo "📦 Now deploying to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel (will prompt for login if needed)
vercel --prod --yes

echo ""
echo "🎉 DONE! Your site is live!"
echo "🦄 Check your Vercel dashboard for the URL"
echo "💡 To add a custom domain, go to: https://vercel.com/unicornvids/unicornvids-com/settings/domains"
