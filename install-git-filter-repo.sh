#!/bin/bash

echo "📦 Installing git-filter-repo..."
echo ""

# Check if already installed
if command -v git-filter-repo &> /dev/null; then
    echo "✅ git-filter-repo is already installed"
    git-filter-repo --version
    exit 0
fi

# Try different installation methods
if command -v pip3 &> /dev/null; then
    echo "📝 Installing via pip3..."
    pip3 install git-filter-repo
elif command -v pip &> /dev/null; then
    echo "📝 Installing via pip..."
    pip install git-filter-repo
elif command -v brew &> /dev/null; then
    echo "📝 Installing via Homebrew..."
    brew install git-filter-repo
elif command -v apt-get &> /dev/null; then
    echo "📝 Installing via apt..."
    sudo apt-get update
    sudo apt-get install -y git-filter-repo
elif command -v yum &> /dev/null; then
    echo "📝 Installing via yum..."
    sudo yum install -y git-filter-repo
else
    echo "❌ Could not find a package manager to install git-filter-repo"
    echo ""
    echo "Manual installation:"
    echo "1. Download from: https://github.com/newren/git-filter-repo/releases"
    echo "2. Or install Python and run: pip install git-filter-repo"
    exit 1
fi

echo ""
if command -v git-filter-repo &> /dev/null; then
    echo "✅ git-filter-repo installed successfully"
    git-filter-repo --version
else
    echo "❌ Installation failed"
    exit 1
fi
