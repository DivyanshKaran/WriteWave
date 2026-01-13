#!/bin/bash

echo "🚨 WARNING: Git History Cleanup"
echo "================================"
echo ""
echo "This script will REWRITE your entire git history to remove node_modules."
echo ""
echo "⚠️  IMPORTANT:"
echo "   - This will change all commit hashes"
echo "   - If you've pushed to a remote, you'll need to force push"
echo "   - All collaborators will need to re-clone the repository"
echo "   - This operation cannot be easily undone"
echo ""
echo "✅ Safe to proceed if:"
echo "   - You haven't pushed to any remote repository yet"
echo "   - OR you're the only person working on this project"
echo "   - OR all collaborators are aware and ready to re-clone"
echo ""
read -p "Do you want to proceed? (type 'yes' to continue): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted. No changes made."
    exit 1
fi

echo ""
echo "🔍 Checking current repository size..."
du -sh .git
echo ""

# Method 1: Using git filter-repo (recommended, faster)
if command -v git-filter-repo &> /dev/null; then
    echo "✅ Using git-filter-repo (recommended method)"
    echo "📝 Removing node_modules from all history..."
    
    git filter-repo --path node_modules --invert-paths --force
    
    echo "✅ History cleaned with git-filter-repo"
    
# Method 2: Using BFG Repo-Cleaner (if available)
elif [ -f "bfg.jar" ]; then
    echo "✅ Using BFG Repo-Cleaner"
    echo "📝 Removing node_modules from all history..."
    
    java -jar bfg.jar --delete-folders node_modules --no-blob-protection
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    echo "✅ History cleaned with BFG"
    
# Method 3: Using git filter-branch (slower, but always available)
else
    echo "⚠️  Using git filter-branch (slower method)"
    echo "📝 This may take 10-30 minutes for large repositories..."
    echo ""
    
    git filter-branch --force --index-filter \
        'git rm -r --cached --ignore-unmatch node_modules frontend/node_modules backend/*/node_modules infrastructure/node_modules' \
        --prune-empty --tag-name-filter cat -- --all
    
    echo "📝 Cleaning up references..."
    rm -rf .git/refs/original/
    
    echo "📝 Expiring reflog..."
    git reflog expire --expire=now --all
    
    echo "📝 Running garbage collection (this may take a while)..."
    git gc --prune=now --aggressive
    
    echo "✅ History cleaned with git filter-branch"
fi

echo ""
echo "🔍 New repository size:"
du -sh .git
echo ""

echo "📊 Verification:"
echo "   Files in git: $(git ls-files | grep -c node_modules || echo 0)"
echo "   History check: $(git log --all --pretty=format: --name-only | grep -c node_modules || echo 0)"
echo ""

if [ $(git ls-files | grep -c node_modules || echo 0) -eq 0 ]; then
    echo "✅ Current index is clean"
else
    echo "⚠️  Some files still in index"
fi

if [ $(git log --all --pretty=format: --name-only | grep -c node_modules || echo 0) -eq 0 ]; then
    echo "✅ History is clean"
else
    echo "⚠️  Some files still in history (this is normal for recent commits)"
fi

echo ""
echo "📝 Next steps:"
echo ""
echo "1. Verify the cleanup:"
echo "   git log --all --oneline | head -20"
echo "   git ls-files | grep node_modules"
echo ""
echo "2. If you have a remote repository:"
echo "   git remote -v  # Check your remotes"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Notify collaborators to re-clone:"
echo "   rm -rf writewave"
echo "   git clone <repository-url>"
echo ""
echo "⚠️  WARNING: Force push will overwrite remote history!"
echo ""
