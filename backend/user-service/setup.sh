#!/bin/bash

# WriteWave User Service - Complete Setup Script
# This script sets up the User Service with all dependencies, database, and prepares it for Postman testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WriteWave User Service Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) is installed"

# Check if PostgreSQL is installed
print_info "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed. You'll need to set up PostgreSQL separately."
    print_info "For local development, you can use Docker with: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15"
else
    print_success "PostgreSQL is installed"
fi

# Check if Redis is installed
print_info "Checking Redis installation..."
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis is not installed. You'll need to set up Redis separately."
    print_info "For local development, you can use Docker with: docker run -d -p 6379:6379 redis:7-alpine"
else
    print_success "Redis is installed"
fi

# Create .env file if it doesn't exist
print_info "Setting up environment configuration..."
if [ ! -f .env ]; then
    print_info "Creating .env file from env.example..."
    cp env.example .env
    print_warning "Please edit .env file with your configuration before proceeding."
    print_info "Database URL: postgresql://user:password@localhost:5432/writewave_users"
    print_info "Redis URL: redis://localhost:6379"
    print_info "JWT secrets: Generate secure random strings"
else
    print_success ".env file already exists"
fi

# Install dependencies
print_info "Installing npm dependencies..."
if [ -d node_modules ]; then
    print_warning "node_modules directory already exists. Skipping npm install."
    print_info "If you want to reinstall, delete node_modules and run this script again."
else
    npm install
    print_success "Dependencies installed"
fi

# Check if .env has been configured
print_info "Verifying environment configuration..."
if grep -q "your-super-secret-jwt-key" .env; then
    print_warning "Default JWT secret detected in .env file."
    print_info "Generating secure JWT secrets..."
    
    # Generate secure random secrets
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    # Update .env file with generated secrets
    sed -i.bak "s|your-super-secret-jwt-key|$JWT_SECRET|g" .env
    sed -i.bak "s|your-super-secret-refresh-key-change-in-production|$JWT_REFRESH_SECRET|g" .env
    sed -i.bak "s|your-session-secret-change-in-production|$SESSION_SECRET|g" .env
    
    # Clean up backup file
    rm -f .env.bak
    
    print_success "Secure JWT secrets generated and updated in .env"
fi

# Create logs directory if it doesn't exist
print_info "Creating logs directory..."
mkdir -p logs
touch logs/combined.log logs/error.log
print_success "Logs directory created"

# Create uploads directory if it doesn't exist
print_info "Creating uploads directory..."
mkdir -p uploads
print_success "Uploads directory created"

# Generate Prisma Client
print_info "Generating Prisma Client..."
if npx prisma generate; then
    print_success "Prisma Client generated"
else
    print_error "Failed to generate Prisma Client"
    exit 1
fi

# Check database connection
print_info "Checking database connection..."
if ! command -v psql &> /dev/null; then
    print_warning "Cannot test database connection without PostgreSQL CLI tools."
    print_info "Please ensure PostgreSQL is running and accessible."
else
    # Extract database URL from .env
    if grep -q "DATABASE_URL=" .env; then
        DB_URL=$(grep "DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        print_info "Attempting to connect to database..."
        # Try to connect to PostgreSQL (this might fail, but we'll catch it)
        # We can't use psql to test connection in script reliably, so we'll let Prisma handle it
        print_info "Database connection will be tested when migrations run."
    fi
fi

# Run database migrations
print_info "Running database migrations..."
if npx prisma migrate deploy; then
    print_success "Database migrations completed"
else
    print_warning "Failed to run migrations. This might be expected if this is the first setup."
    print_info "Attempting to run initial migration..."
    if npx prisma migrate dev --name init; then
        print_success "Initial migration completed"
    else
        print_error "Failed to run database migrations."
        print_info "Please check your DATABASE_URL in .env file."
        exit 1
    fi
fi

# Verify Prisma Client is generated
print_info "Verifying Prisma Client installation..."
if [ -d "node_modules/.prisma/client" ]; then
    print_success "Prisma Client is installed"
else
    print_error "Prisma Client is not installed properly"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Start the Development Server:${NC}"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo -e "${YELLOW}2. Or Build and Start Production Server:${NC}"
echo -e "   ${BLUE}npm run build${NC}"
echo -e "   ${BLUE}npm start${NC}"
echo ""
echo -e "${YELLOW}3. Test the API with Postman:${NC}"
echo ""
echo -e "${BLUE}Base URL: http://localhost:8001${NC}"
echo -e "${BLUE}API Version: v1${NC}"
echo ""
echo -e "${GREEN}Available Endpoints for Postman Testing:${NC}"
echo ""
echo -e "${YELLOW}Health Check:${NC}"
echo -e "  GET http://localhost:8001/api/v1/health"
echo ""
echo -e "${YELLOW}Authentication Endpoints:${NC}"
echo -e "  POST http://localhost:8001/api/v1/auth/register"
echo -e "     Body: { \"email\": \"test@example.com\", \"password\": \"TestPassword123!\", \"firstName\": \"Test\", \"lastName\": \"User\" }"
echo ""
echo -e "  POST http://localhost:8001/api/v1/auth/login"
echo -e "     Body: { \"email\": \"test@example.com\", \"password\": \"TestPassword123!\" }"
echo ""
echo -e "  POST http://localhost:8001/api/v1/auth/refresh-token"
echo -e "     Body: { \"refreshToken\": \"your-refresh-token-here\" }"
echo ""
echo -e "  POST http://localhost:8001/api/v1/auth/logout"
echo -e "     Headers: Authorization: Bearer your-access-token-here"
echo -e "     Body: { \"refreshToken\": \"your-refresh-token-here\" }"
echo ""
echo -e "${YELLOW}User Endpoints (require authentication):${NC}"
echo -e "  GET http://localhost:8001/api/v1/users/profile"
echo -e "     Headers: Authorization: Bearer your-access-token-here"
echo ""
echo -e "  PUT http://localhost:8001/api/v1/users/profile"
echo -e "     Headers: Authorization: Bearer your-access-token-here"
echo -e "     Body: { \"firstName\": \"John\", \"lastName\": \"Doe\", \"bio\": \"Developer\" }"
echo ""
echo -e "  GET http://localhost:8001/api/v1/users/settings"
echo -e "     Headers: Authorization: Bearer your-access-token-here"
echo ""
echo -e "  PUT http://localhost:8001/api/v1/users/settings"
echo -e "     Headers: Authorization: Bearer your-access-token-here"
echo -e "     Body: { \"emailNotifications\": true, \"theme\": \"dark\" }"
echo ""
echo -e "${YELLOW}Postman Collection Import:${NC}"
echo -e "  You can create a Postman collection with these endpoints and test them."
echo ""
echo -e "${BLUE}Server will start on: http://localhost:8001${NC}"
echo ""
print_success "Setup completed successfully! 🎉"

