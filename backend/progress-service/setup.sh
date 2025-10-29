#!/bin/bash

# Progress Service Setup Script
# This script sets up the progress-service for development

# Note: We don't use 'set -e' because we want to handle errors gracefully
# and provide fallback options (e.g., npm ci -> npm install)

echo "🚀 Setting up Progress Service..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run this script as root/sudo${NC}"
   exit 1
fi

# Step 1: Fix permissions
echo -e "${YELLOW}Step 1: Fixing permissions...${NC}"
if [ -d "node_modules" ]; then
    if [ -O "node_modules" ]; then
        echo "✅ node_modules permissions are correct"
    else
        echo "⚠️  Fixing node_modules ownership..."
        sudo chown -R $USER:$USER node_modules 2>/dev/null || true
        echo "✅ Permissions fixed"
    fi
else
    echo "ℹ️  node_modules directory doesn't exist yet (will be created)"
fi

# Fix ownership of entire directory to prevent future issues
echo "Fixing project directory ownership..."
sudo chown -R $USER:$USER . 2>/dev/null || true
echo -e "${GREEN}✅ Permissions setup complete${NC}"
echo ""

# Step 2: Check Node.js version
echo -e "${YELLOW}Step 2: Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
if [ -f "package-lock.json" ]; then
    echo "Attempting npm ci for reproducible builds..."
    if npm ci 2>/dev/null; then
        echo -e "${GREEN}✅ Dependencies installed with npm ci${NC}"
    else
        echo -e "${YELLOW}⚠️  package-lock.json is out of sync with package.json${NC}"
        echo "Removing node_modules and updating lock file..."
        rm -rf node_modules
        echo "Running npm install to sync package-lock.json..."
        npm install
        echo -e "${GREEN}✅ Dependencies installed and package-lock.json updated${NC}"
    fi
else
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi
echo ""

# Step 4: Setup environment file
echo -e "${YELLOW}Step 4: Setting up environment file...${NC}"
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${GREEN}✅ Created .env file from env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env file with your configuration${NC}"
    else
        echo -e "${RED}❌ env.example file not found${NC}"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi
echo ""

# Step 5: Generate Prisma client
echo -e "${YELLOW}Step 5: Generating Prisma client...${NC}"
if npm run prisma:generate >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma generate failed. Make sure dependencies are installed.${NC}"
    echo "You can run 'npm run prisma:generate' manually later."
fi
echo ""

# Step 6: Check database connection
echo -e "${YELLOW}Step 6: Checking database connection...${NC}"
if [ -f ".env" ]; then
    # Load .env file
    export $(grep -v '^#' .env | xargs)
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not set in .env file${NC}"
        echo "   Please set DATABASE_URL before running migrations"
    else
        echo "✅ DATABASE_URL is configured"
        echo "   To run migrations: npm run prisma:migrate"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start PostgreSQL and Redis (if not using Docker)"
echo "3. Run database migrations: npm run prisma:migrate"
echo "4. Start the service: npm run dev"
echo ""
echo "For Docker setup:"
echo "  docker-compose up -d db redis"
echo ""

