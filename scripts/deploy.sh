#!/bin/bash

# WriteWave Deployment Script
# ===========================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-development}"
ACTION="${2:-deploy}"
DRY_RUN="${3:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation functions
validate_environment() {
    case "$ENVIRONMENT" in
        development|staging|production)
            log_info "Environment: $ENVIRONMENT"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

validate_action() {
    case "$ACTION" in
        deploy|destroy|plan|validate|test)
            log_info "Action: $ACTION"
            ;;
        *)
            log_error "Invalid action: $ACTION"
            log_error "Valid actions: deploy, destroy, plan, validate, test"
            exit 1
            ;;
    esac
}

# Prerequisites check
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required tools
    local required_tools=("kubectl" "helm" "docker" "terraform")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check environment-specific tools
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if ! command -v "aws" &> /dev/null; then
            log_error "AWS CLI is required for production deployment"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Environment setup
setup_environment() {
    log_info "Setting up environment: $ENVIRONMENT"
    
    # Set environment variables
    export ENVIRONMENT="$ENVIRONMENT"
    export PROJECT_ROOT="$PROJECT_ROOT"
    export KUBECONFIG="$PROJECT_ROOT/.kube/config-$ENVIRONMENT"
    
    # Create kubeconfig directory if it doesn't exist
    mkdir -p "$(dirname "$KUBECONFIG")"
    
    # Load environment-specific configuration
    if [[ -f "$PROJECT_ROOT/infrastructure/environments/$ENVIRONMENT/.env" ]]; then
        log_info "Loading environment configuration..."
        set -a
        source "$PROJECT_ROOT/infrastructure/environments/$ENVIRONMENT/.env"
        set +a
    fi
    
    log_success "Environment setup completed"
}

# Terraform operations
terraform_init() {
    log_info "Initializing Terraform..."
    
    cd "$PROJECT_ROOT/infrastructure/terraform"
    
    terraform init \
        -backend-config="bucket=writewave-terraform-state" \
        -backend-config="key=infrastructure/$ENVIRONMENT/terraform.tfstate" \
        -backend-config="region=us-east-1" \
        -backend-config="dynamodb_table=writewave-terraform-locks"
    
    log_success "Terraform initialized"
}

terraform_plan() {
    log_info "Planning Terraform changes..."
    
    cd "$PROJECT_ROOT/infrastructure/terraform"
    
    terraform plan \
        -var="environment=$ENVIRONMENT" \
        -var="aws_region=${AWS_REGION:-us-east-1}" \
        -var="domain_name=${DOMAIN_NAME:-writewave.com}" \
        -out="terraform-$ENVIRONMENT.tfplan"
    
    log_success "Terraform plan completed"
}

terraform_apply() {
    log_info "Applying Terraform changes..."
    
    cd "$PROJECT_ROOT/infrastructure/terraform"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "Dry run mode - no changes will be applied"
        terraform plan -var="environment=$ENVIRONMENT"
    else
        terraform apply "terraform-$ENVIRONMENT.tfplan"
    fi
    
    log_success "Terraform apply completed"
}

terraform_destroy() {
    log_info "Destroying Terraform infrastructure..."
    
    cd "$PROJECT_ROOT/infrastructure/terraform"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "Dry run mode - no changes will be applied"
        terraform plan -destroy -var="environment=$ENVIRONMENT"
    else
        terraform destroy -var="environment=$ENVIRONMENT" -auto-approve
    fi
    
    log_success "Terraform destroy completed"
}

# Kubernetes operations
setup_kubectl() {
    log_info "Setting up kubectl for $ENVIRONMENT..."
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        # For development, use local kubeconfig
        if [[ -f "$PROJECT_ROOT/.kube/config" ]]; then
            cp "$PROJECT_ROOT/.kube/config" "$KUBECONFIG"
        else
            log_warning "Local kubeconfig not found, using default"
        fi
    else
        # For staging/production, get kubeconfig from AWS EKS
        aws eks update-kubeconfig \
            --region "${AWS_REGION:-us-east-1}" \
            --name "writewave-$ENVIRONMENT" \
            --kubeconfig "$KUBECONFIG"
    fi
    
    log_success "kubectl configured"
}

deploy_istio() {
    log_info "Deploying Istio service mesh..."
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        log_warning "Skipping Istio for development environment"
        return
    fi
    
    # Install Istio
    helm repo add istio https://istio-release.storage.googleapis.com/charts
    helm repo update
    
    # Install Istio base
    helm upgrade --install istio-base istio/base \
        --namespace istio-system \
        --create-namespace \
        --kubeconfig "$KUBECONFIG"
    
    # Install Istiod
    helm upgrade --install istiod istio/istiod \
        --namespace istio-system \
        --values "$PROJECT_ROOT/infrastructure/istio/values-$ENVIRONMENT.yaml" \
        --kubeconfig "$KUBECONFIG"
    
    # Install Istio ingress gateway
    helm upgrade --install istio-ingressgateway istio/gateway \
        --namespace istio-system \
        --kubeconfig "$KUBECONFIG"
    
    log_success "Istio deployed"
}

deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    # Create monitoring namespace
    kubectl create namespace monitoring --kubeconfig "$KUBECONFIG" || true
    
    # Deploy Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --values "$PROJECT_ROOT/infrastructure/monitoring/prometheus-grafana/values-$ENVIRONMENT.yaml" \
        --kubeconfig "$KUBECONFIG"
    
    # Deploy ELK stack
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    helm upgrade --install elasticsearch elastic/elasticsearch \
        --namespace monitoring \
        --values "$PROJECT_ROOT/infrastructure/monitoring/elk-stack/values-$ENVIRONMENT.yaml" \
        --kubeconfig "$KUBECONFIG"
    
    helm upgrade --install kibana elastic/kibana \
        --namespace monitoring \
        --values "$PROJECT_ROOT/infrastructure/monitoring/elk-stack/kibana-values-$ENVIRONMENT.yaml" \
        --kubeconfig "$KUBECONFIG"
    
    # Deploy Jaeger
    helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
    helm repo update
    
    helm upgrade --install jaeger jaegertracing/jaeger \
        --namespace monitoring \
        --values "$PROJECT_ROOT/infrastructure/monitoring/jaeger/values-$ENVIRONMENT.yaml" \
        --kubeconfig "$KUBECONFIG"
    
    log_success "Monitoring stack deployed"
}

deploy_microservices() {
    log_info "Deploying microservices..."
    
    # Create application namespace
    kubectl create namespace "writewave-$ENVIRONMENT" --kubeconfig "$KUBECONFIG" || true
    
    # Deploy each microservice
    local services=("user-service" "content-service" "progress-service" "community-service" "notification-service" "analytics-service")
    
    for service in "${services[@]}"; do
        log_info "Deploying $service..."
        
        helm upgrade --install "$service" "$PROJECT_ROOT/infrastructure/kubernetes/$service" \
            --namespace "writewave-$ENVIRONMENT" \
            --values "$PROJECT_ROOT/infrastructure/environments/$ENVIRONMENT/values.yaml" \
            --set "image.tag=${IMAGE_TAG:-latest}" \
            --kubeconfig "$KUBECONFIG"
    done
    
    log_success "Microservices deployed"
}

deploy_ingress() {
    log_info "Deploying ingress controller..."
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        # Use NGINX ingress for development
        helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
        helm repo update
        
        helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
            --namespace ingress-nginx \
            --create-namespace \
            --kubeconfig "$KUBECONFIG"
    else
        # Use Istio ingress for staging/production
        log_info "Using Istio ingress gateway"
    fi
    
    # Deploy ingress rules
    kubectl apply -f "$PROJECT_ROOT/infrastructure/kubernetes/ingress/ingress-$ENVIRONMENT.yaml" \
        --kubeconfig "$KUBECONFIG"
    
    log_success "Ingress deployed"
}

# Health checks
run_health_checks() {
    log_info "Running health checks..."
    
    local namespace="writewave-$ENVIRONMENT"
    local services=("user-service" "content-service" "progress-service" "community-service" "notification-service" "analytics-service")
    
    for service in "${services[@]}"; do
        log_info "Checking health of $service..."
        
        # Wait for deployment to be ready
        kubectl wait --for=condition=available --timeout=300s \
            deployment/"$service" -n "$namespace" \
            --kubeconfig "$KUBECONFIG"
        
        # Check pod status
        local pod_status=$(kubectl get pods -n "$namespace" -l app="$service" \
            --kubeconfig "$KUBECONFIG" -o jsonpath='{.items[0].status.phase}')
        
        if [[ "$pod_status" == "Running" ]]; then
            log_success "$service is healthy"
        else
            log_error "$service is not healthy (status: $pod_status)"
            exit 1
        fi
    done
    
    log_success "All health checks passed"
}

# Testing
run_tests() {
    log_info "Running deployment tests..."
    
    # Run smoke tests
    if [[ -f "$PROJECT_ROOT/scripts/smoke-tests.sh" ]]; then
        bash "$PROJECT_ROOT/scripts/smoke-tests.sh" "$ENVIRONMENT"
    fi
    
    # Run integration tests
    if [[ -f "$PROJECT_ROOT/scripts/integration-tests.sh" ]]; then
        bash "$PROJECT_ROOT/scripts/integration-tests.sh" "$ENVIRONMENT"
    fi
    
    log_success "Tests completed"
}

# Cleanup
cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Remove temporary kubeconfig
    if [[ -f "$KUBECONFIG" && "$KUBECONFIG" != "$HOME/.kube/config" ]]; then
        rm -f "$KUBECONFIG"
    fi
    
    # Remove Terraform plan files
    find "$PROJECT_ROOT/infrastructure/terraform" -name "terraform-*.tfplan" -delete
    
    log_success "Cleanup completed"
}

# Main deployment function
deploy() {
    log_info "Starting deployment to $ENVIRONMENT environment..."
    
    case "$ACTION" in
        "plan")
            terraform_init
            terraform_plan
            ;;
        "deploy")
            terraform_init
            terraform_plan
            terraform_apply
            setup_kubectl
            deploy_istio
            deploy_monitoring
            deploy_microservices
            deploy_ingress
            run_health_checks
            run_tests
            ;;
        "destroy")
            terraform_destroy
            ;;
        "validate")
            terraform_init
            terraform_plan
            ;;
        "test")
            setup_kubectl
            run_tests
            ;;
        *)
            log_error "Unknown action: $ACTION"
            exit 1
            ;;
    esac
    
    log_success "Deployment completed successfully!"
}

# Error handling
trap cleanup EXIT

# Main execution
main() {
    log_info "WriteWave Deployment Script"
    log_info "Environment: $ENVIRONMENT"
    log_info "Action: $ACTION"
    log_info "Dry Run: $DRY_RUN"
    
    validate_environment
    validate_action
    check_prerequisites
    setup_environment
    
    deploy
    
    log_success "Script completed successfully!"
}

# Help function
show_help() {
    cat << EOF
WriteWave Deployment Script

Usage: $0 <environment> <action> [dry-run]

Arguments:
  environment    Target environment (development|staging|production)
  action         Action to perform (deploy|destroy|plan|validate|test)
  dry-run        Optional. Set to 'true' for dry run mode

Examples:
  $0 development deploy
  $0 production plan
  $0 staging destroy true
  $0 development test

EOF
}

# Check if help is requested
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    show_help
    exit 0
fi

# Check if minimum arguments are provided
if [[ $# -lt 2 ]]; then
    log_error "Missing required arguments"
    show_help
    exit 1
fi

# Run main function
main "$@"
