#!/bin/bash

# Kong API Gateway Deployment Script for WriteWave
# This script handles deployment for different environments

set -e

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

# Default environment
ENVIRONMENT="development"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment ENV    Environment to deploy (development, staging, production)"
            echo "  -h, --help              Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Valid environments: development, staging, production"
    exit 1
fi

print_status "Deploying Kong API Gateway for environment: $ENVIRONMENT"

# Set environment-specific variables
case $ENVIRONMENT in
    "development")
        COMPOSE_FILE="docker-compose.dev.yml"
        CONFIG_FILE="config/development.yml"
        ;;
    "staging")
        COMPOSE_FILE="docker-compose.staging.yml"
        CONFIG_FILE="config/staging.yml"
        ;;
    "production")
        COMPOSE_FILE="docker-compose.prod.yml"
        CONFIG_FILE="config/production.yml"
        ;;
esac

# Check if required files exist
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Check if .env file exists for non-development environments
if [ "$ENVIRONMENT" != "development" ] && [ ! -f ".env" ]; then
    print_error "Environment file .env not found for $ENVIRONMENT"
    print_error "Please copy env.example to .env and update the values"
    exit 1
fi

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to stop existing services
stop_services() {
    print_status "Stopping existing services..."
    if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        docker-compose -f "$COMPOSE_FILE" down
        print_success "Services stopped"
    else
        print_status "No existing services to stop"
    fi
}

# Function to pull latest images
pull_images() {
    print_status "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    print_success "Images pulled"
}

# Function to build custom images
build_images() {
    print_status "Building custom images..."
    docker-compose -f "$COMPOSE_FILE" build
    print_success "Images built"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Services started"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose -f "$COMPOSE_FILE" exec -T kong-database pg_isready -U kong > /dev/null 2>&1; do
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Redis is ready"
    
    # Wait for Kong
    print_status "Waiting for Kong..."
    until curl -s http://localhost:8001/status > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Kong is ready"
}

# Function to apply Kong configuration
apply_kong_config() {
    print_status "Applying Kong configuration..."
    
    # Wait a bit more for Kong to be fully ready
    sleep 10
    
    # Apply configuration
    if docker-compose -f "$COMPOSE_FILE" exec -T kong kong config db_import /usr/local/kong/kong.yml > /dev/null 2>&1; then
        print_success "Kong configuration applied"
    else
        print_warning "Failed to apply Kong configuration automatically"
        print_warning "You may need to apply it manually using the Admin API"
    fi
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
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
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is working"
    else
        print_error "Redis is not working"
        return 1
    fi
    
    print_success "All health checks passed"
}

# Function to display deployment status
display_status() {
    print_status "Deployment completed successfully!"
    echo
    echo "📋 Service Information:"
    echo "  • Kong API Gateway: http://localhost:8000"
    echo "  • Kong Admin API: http://localhost:8001"
    echo "  • Health Check: http://localhost:8000/health"
    echo "  • PostgreSQL: localhost:5432"
    echo "  • Redis: localhost:6379"
    echo
    echo "🔧 Management Commands:"
    echo "  • View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  • Stop services: docker-compose -f $COMPOSE_FILE down"
    echo "  • Restart services: docker-compose -f $COMPOSE_FILE restart"
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

# Function to rollback deployment
rollback() {
    print_warning "Rolling back deployment..."
    stop_services
    print_success "Rollback completed"
}

# Main deployment function
deploy() {
    print_status "Starting deployment for $ENVIRONMENT environment..."
    
    # Pre-deployment checks
    check_docker
    check_docker_compose
    
    # Deployment steps
    stop_services
    pull_images
    build_images
    start_services
    wait_for_services
    apply_kong_config
    
    # Post-deployment checks
    if run_health_checks; then
        display_status
    else
        print_error "Health checks failed. Rolling back..."
        rollback
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "deploy")
        deploy
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose -f "$COMPOSE_FILE" restart
        wait_for_services
        run_health_checks
        display_status
        ;;
    "status")
        print_status "Checking service status..."
        docker-compose -f "$COMPOSE_FILE" ps
        echo
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Kong is healthy"
        else
            print_error "Kong is not responding"
        fi
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
    "health")
        run_health_checks
        ;;
    *)
        deploy
        ;;
esac
