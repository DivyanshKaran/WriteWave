#!/bin/bash

echo "🧹 Removing node_modules from git repository..."
echo "⚠️  This will take a few minutes due to the large number of files (42,601)"
echo ""

# Remove all node_modules directories from git tracking
echo "📝 Step 1: Removing node_modules from git index..."
git rm -r --cached node_modules 2>/dev/null || true
git rm -r --cached frontend/node_modules 2>/dev/null || true
git rm -r --cached backend/*/node_modules 2>/dev/null || true
git rm -r --cached infrastructure/node_modules 2>/dev/null || true

# More aggressive approach - remove all node_modules paths
echo "📝 Step 2: Removing all node_modules paths..."
git ls-files | grep node_modules | xargs -r git rm --cached

echo ""
echo "✅ Removal complete!"
echo ""
echo "📊 Checking remaining node_modules files..."
REMAINING=$(git ls-files | grep -c node_modules || echo "0")
echo "   Remaining: $REMAINING files"
echo ""

if [ "$REMAINING" -eq "0" ]; then
    echo "✅ All node_modules files removed from git!"
else
    echo "⚠️  Some files remain. Running additional cleanup..."
    # Force remove any remaining
    git ls-files | grep node_modules | while read file; do
        git rm --cached "$file" 2>/dev/null || true
    done
fi

echo ""
echo "📝 Next steps:"
echo "1. Verify .gitignore has node_modules patterns"
echo "2. Commit the changes:"
echo "   git add .gitignore"
echo "   git commit -m 'chore: Remove node_modules from version control'"
echo ""
echo "3. Verify cleanup:"
echo "   git ls-files | grep node_modules | wc -l"
echo "   (should be 0)"
echo ""
