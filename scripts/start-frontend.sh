#!/bin/bash

# ============================================================================
# LOCAL DEVELOPMENT SCRIPT - Frontend Setup
# ============================================================================
# This script is for LOCAL DEVELOPMENT ONLY
# It deletes the dist folder, installs dependencies, and rebuilds the frontend
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Frontend directory
FRONTEND_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")/frontend"

echo -e "${YELLOW}Starting frontend rebuild process...${NC}"

# Step 1: Delete existing dist folder
echo -e "${YELLOW}Step 1: Deleting existing dist folder...${NC}"
if [ -d "$FRONTEND_DIR/dist" ]; then
    rm -rf "$FRONTEND_DIR/dist"
    echo -e "${GREEN}✓ Dist folder deleted${NC}"
else
    echo -e "${YELLOW}No dist folder found, skipping deletion${NC}"
fi

# Step 2: Navigate to frontend directory
cd "$FRONTEND_DIR" || exit 1

# Step 3: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Build the frontend
echo -e "${YELLOW}Step 3: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 5: Start the frontend server
echo -e "${YELLOW}Step 4: Starting frontend development server...${NC}"
npm run dev

