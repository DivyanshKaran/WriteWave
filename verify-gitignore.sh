#!/bin/bash

echo "🔍 Verifying .gitignore configuration..."
echo ""

# Check if node_modules is in .gitignore
if grep -q "node_modules" .gitignore; then
    echo "✅ node_modules found in .gitignore"
else
    echo "❌ node_modules NOT found in .gitignore"
    echo "   Adding it now..."
    echo "" >> .gitignore
    echo "# Node modules" >> .gitignore
    echo "node_modules/" >> .gitignore
    echo "**/node_modules/" >> .gitignore
fi

echo ""
echo "📋 Current .gitignore patterns for node_modules:"
grep -n "node_modules" .gitignore

echo ""
echo "🧪 Testing if node_modules will be ignored..."
if git check-ignore node_modules/test 2>/dev/null; then
    echo "✅ node_modules will be ignored"
else
    echo "❌ node_modules will NOT be ignored"
    echo "   Check your .gitignore file"
fi

echo ""
echo "📊 Current status:"
echo "   Files in git: $(git ls-files | grep -c node_modules || echo 0)"
echo "   Files on disk: $(find . -path '*/node_modules/*' -type f 2>/dev/null | wc -l)"
echo ""
