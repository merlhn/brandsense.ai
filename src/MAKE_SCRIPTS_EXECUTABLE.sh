#!/bin/bash

# Make all deployment scripts executable
# Run this once after cloning the repository

echo "🔧 Making deployment scripts executable..."
echo ""

chmod +x DEPLOYMENT_COMMANDS.sh
echo "✓ DEPLOYMENT_COMMANDS.sh"

chmod +x QUICK_DEPLOY_VERCEL.sh
echo "✓ QUICK_DEPLOY_VERCEL.sh"

chmod +x QUICK_DEPLOY.sh
echo "✓ QUICK_DEPLOY.sh"

chmod +x CREATE_RELEASE.sh
echo "✓ CREATE_RELEASE.sh"

chmod +x SETUP_CURSOR.sh
echo "✓ SETUP_CURSOR.sh"

echo ""
echo "✅ All scripts are now executable!"
echo ""
echo "You can now run:"
echo "  ./DEPLOYMENT_COMMANDS.sh - Interactive deployment"
echo "  ./QUICK_DEPLOY_VERCEL.sh - Automated Vercel deployment"
echo "  ./SETUP_CURSOR.sh - Cursor IDE setup"
echo ""
