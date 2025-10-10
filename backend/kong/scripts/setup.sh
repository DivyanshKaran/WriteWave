#!/bin/bash

# Kong API Gateway Setup Script for WriteWave
# This script sets up the Kong API Gateway with all necessary configurations

set -e

echo "🚀 Setting up Kong API Gateway for WriteWave..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if required ports are available
check_ports() {
    print_status "Checking port availability..."
    
    local ports=(8000 8001 5432 6379)
    local occupied_ports=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            occupied_ports+=($port)
        fi
    done
    
    if [ ${#occupied_ports[@]} -ne 0 ]; then
        print_warning "The following ports are already in use: ${occupied_ports[*]}"
        print_warning "Please stop the services using these ports or modify the configuration"
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Ports are available"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p plugins
    mkdir -p logs
    mkdir -p data
    
    print_success "Directories created"
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
# Kong Configuration
KONG_DATABASE=postgres
KONG_PG_HOST=kong-database
KONG_PG_USER=kong
KONG_PG_PASSWORD=kong
KONG_PG_DATABASE=kong

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=writewave-secret-key-change-in-production
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# Rate Limiting
USER_RATE_LIMIT=100
IP_RATE_LIMIT=1000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://writewave.app

# Logging
LOG_LEVEL=info
LOG_TO_REDIS=true
LOG_TO_FILE=true
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Pull required images
    docker-compose pull
    
    # Build custom images if needed
    docker-compose build
    
    # Start services
    docker-compose up -d
    
    print_success "Services started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose exec -T kong-database pg_isready -U kong; do
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose exec -T redis redis-cli ping; do
        sleep 2
    done
    print_success "Redis is ready"
    
    # Wait for Kong
    print_status "Waiting for Kong..."
    until curl -s http://localhost:8001/status > /dev/null; do
        sleep 2
    done
    print_success "Kong is ready"
}

# Apply Kong configuration
apply_kong_config() {
    print_status "Applying Kong configuration..."
    
    # Wait a bit more for Kong to be fully ready
    sleep 10
    
    # Apply configuration
    if docker-compose exec -T kong kong config db_import /usr/local/kong/kong.yml; then
        print_success "Kong configuration applied"
    else
        print_warning "Failed to apply Kong configuration automatically"
        print_warning "You may need to apply it manually using the Admin API"
    fi
}

# Test the setup
test_setup() {
    print_status "Testing the setup..."
    
    # Test Kong health
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        print_success "Kong health check passed"
    else
        print_error "Kong health check failed"
        return 1
    fi
    
    # Test Admin API
    if curl -s http://localhost:8001/status | grep -q "database"; then
        print_success "Kong Admin API is accessible"
    else
        print_error "Kong Admin API is not accessible"
        return 1
    fi
    
    # Test Redis
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is working"
    else
        print_error "Redis is not working"
        return 1
    fi
    
    print_success "All tests passed"
}

# Display status information
display_status() {
    print_status "Setup completed successfully!"
    echo
    echo "📋 Service Information:"
    echo "  • Kong API Gateway: http://localhost:8000"
    echo "  • Kong Admin API: http://localhost:8001"
    echo "  • Health Check: http://localhost:8000/health"
    echo "  • PostgreSQL: localhost:5432"
    echo "  • Redis: localhost:6379"
    echo
    echo "🔧 Management Commands:"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Restart services: docker-compose restart"
    echo "  • View Kong status: curl http://localhost:8001/status"
    echo
    echo "📚 Documentation:"
    echo "  • Kong Admin API: http://localhost:8001"
    echo "  • Plugin documentation: ./README.md"
    echo
    echo "🚀 Next Steps:"
    echo "  1. Configure your microservices to connect to the gateway"
    echo "  2. Set up authentication tokens"
    echo "  3. Configure rate limiting policies"
    echo "  4. Set up monitoring and logging"
    echo
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v
    print_success "Cleanup completed"
}

# Main execution
main() {
    echo "🎯 WriteWave Kong API Gateway Setup"
    echo "=================================="
    echo
    
    # Check prerequisites
    check_docker
    check_ports
    
    # Setup
    create_directories
    setup_environment
    start_services
    wait_for_services
    apply_kong_config
    
    # Test and display status
    if test_setup; then
        display_status
    else
        print_error "Setup completed with errors. Please check the logs."
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "cleanup")
        cleanup
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose restart
        wait_for_services
        test_setup
        display_status
        ;;
    "status")
        print_status "Checking service status..."
        docker-compose ps
        echo
        if curl -s http://localhost:8000/health > /dev/null; then
            print_success "Kong is healthy"
        else
            print_error "Kong is not responding"
        fi
        ;;
    "logs")
        docker-compose logs -f
        ;;
    *)
        main
        ;;
esac
