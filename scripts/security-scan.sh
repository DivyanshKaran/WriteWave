#!/bin/bash

# WriteWave Security Scanning Script
# ==================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCAN_TYPE="${1:-all}"
ENVIRONMENT="${2:-development}"

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
validate_scan_type() {
    case "$SCAN_TYPE" in
        all|code|container|infrastructure|dependencies|secrets)
            log_info "Scan type: $SCAN_TYPE"
            ;;
        *)
            log_error "Invalid scan type: $SCAN_TYPE"
            log_error "Valid scan types: all, code, container, infrastructure, dependencies, secrets"
            exit 1
            ;;
    esac
}

# Prerequisites check
check_prerequisites() {
    log_info "Checking security scanning prerequisites..."
    
    # Check required tools
    local required_tools=("docker" "trivy" "semgrep" "bandit" "npm" "pip")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_warning "$tool is not installed or not in PATH"
        fi
    done
    
    log_success "Prerequisites check completed"
}

# Code security scanning
scan_code() {
    log_info "Running code security scans..."
    
    # Semgrep for general code analysis
    if command -v semgrep &> /dev/null; then
        log_info "Running Semgrep analysis..."
        semgrep --config=auto \
            --json \
            --output="$PROJECT_ROOT/security-reports/semgrep-report.json" \
            "$PROJECT_ROOT" || true
    fi
    
    # Bandit for Python security issues
    if command -v bandit &> /dev/null; then
        log_info "Running Bandit analysis..."
        find "$PROJECT_ROOT" -name "*.py" -exec bandit -r {} \; \
            > "$PROJECT_ROOT/security-reports/bandit-report.txt" 2>&1 || true
    fi
    
    # ESLint security rules for JavaScript/TypeScript
    log_info "Running ESLint security analysis..."
    cd "$PROJECT_ROOT"
    for service in backend/*/; do
        if [[ -f "$service/package.json" ]]; then
            log_info "Scanning $service..."
            cd "$service"
            npm run lint:security 2>/dev/null || true
            cd "$PROJECT_ROOT"
        fi
    done
    
    log_success "Code security scans completed"
}

# Container security scanning
scan_containers() {
    log_info "Running container security scans..."
    
    # Create reports directory
    mkdir -p "$PROJECT_ROOT/security-reports"
    
    # Scan Docker images with Trivy
    if command -v trivy &> /dev/null; then
        log_info "Running Trivy container scans..."
        
        # Scan base images
        local base_images=("node:18-alpine" "postgres:15-alpine" "redis:7-alpine")
        for image in "${base_images[@]}"; do
            log_info "Scanning base image: $image"
            trivy image --format json \
                --output "$PROJECT_ROOT/security-reports/trivy-$image.json" \
                "$image" || true
        done
        
        # Scan application images
        local services=("user-service" "content-service" "progress-service" "community-service" "notification-service" "analytics-service")
        for service in "${services[@]}"; do
            log_info "Scanning $service image..."
            trivy image --format json \
                --output "$PROJECT_ROOT/security-reports/trivy-$service.json" \
                "ghcr.io/writewave/$service:latest" || true
        done
    fi
    
    # Scan Dockerfiles
    log_info "Scanning Dockerfiles..."
    find "$PROJECT_ROOT" -name "Dockerfile*" -exec trivy config {} \; \
        > "$PROJECT_ROOT/security-reports/dockerfile-scan.txt" 2>&1 || true
    
    log_success "Container security scans completed"
}

# Infrastructure security scanning
scan_infrastructure() {
    log_info "Running infrastructure security scans..."
    
    # Scan Terraform configurations
    if command -v trivy &> /dev/null; then
        log_info "Scanning Terraform configurations..."
        trivy config --format json \
            --output "$PROJECT_ROOT/security-reports/terraform-scan.json" \
            "$PROJECT_ROOT/infrastructure/terraform" || true
    fi
    
    # Scan Kubernetes manifests
    log_info "Scanning Kubernetes manifests..."
    trivy k8s --format json \
        --output "$PROJECT_ROOT/security-reports/kubernetes-scan.json" \
        "$PROJECT_ROOT/infrastructure/kubernetes" || true
    
    # Scan Helm charts
    log_info "Scanning Helm charts..."
    find "$PROJECT_ROOT/infrastructure" -name "Chart.yaml" -exec dirname {} \; | \
        while read -r chart_dir; do
            log_info "Scanning Helm chart: $chart_dir"
            trivy config --format json \
                --output "$PROJECT_ROOT/security-reports/helm-$(basename "$chart_dir")-scan.json" \
                "$chart_dir" || true
        done
    
    log_success "Infrastructure security scans completed"
}

# Dependency security scanning
scan_dependencies() {
    log_info "Running dependency security scans..."
    
    # Scan Node.js dependencies
    log_info "Scanning Node.js dependencies..."
    cd "$PROJECT_ROOT"
    for service in backend/*/; do
        if [[ -f "$service/package.json" ]]; then
            log_info "Scanning dependencies in $service..."
            cd "$service"
            
            # npm audit
            npm audit --audit-level=moderate \
                > "$PROJECT_ROOT/security-reports/npm-audit-$(basename "$service").txt" 2>&1 || true
            
            # Check for known vulnerabilities
            npm audit --json \
                > "$PROJECT_ROOT/security-reports/npm-audit-$(basename "$service").json" 2>&1 || true
            
            cd "$PROJECT_ROOT"
        fi
    done
    
    # Scan Python dependencies
    log_info "Scanning Python dependencies..."
    if command -v safety &> /dev/null; then
        find "$PROJECT_ROOT" -name "requirements.txt" -exec safety check -r {} \; \
            > "$PROJECT_ROOT/security-reports/python-safety.txt" 2>&1 || true
    fi
    
    # Scan Go dependencies
    log_info "Scanning Go dependencies..."
    if command -v gosec &> /dev/null; then
        find "$PROJECT_ROOT" -name "go.mod" -exec dirname {} \; | \
            while read -r go_dir; do
                log_info "Scanning Go module: $go_dir"
                cd "$go_dir"
                gosec -fmt json \
                    -out "$PROJECT_ROOT/security-reports/gosec-$(basename "$go_dir").json" \
                    ./... || true
                cd "$PROJECT_ROOT"
            done
    fi
    
    log_success "Dependency security scans completed"
}

# Secret scanning
scan_secrets() {
    log_info "Running secret scanning..."
    
    # Use GitLeaks for secret detection
    if command -v gitleaks &> /dev/null; then
        log_info "Running GitLeaks secret scan..."
        gitleaks detect --source "$PROJECT_ROOT" \
            --report-format json \
            --report-path "$PROJECT_ROOT/security-reports/gitleaks-report.json" || true
    fi
    
    # Use TruffleHog for secret detection
    if command -v trufflehog &> /dev/null; then
        log_info "Running TruffleHog secret scan..."
        trufflehog filesystem "$PROJECT_ROOT" \
            --output "$PROJECT_ROOT/security-reports/trufflehog-report.txt" || true
    fi
    
    # Manual secret patterns
    log_info "Scanning for common secret patterns..."
    grep -r -i -E "(password|secret|key|token|api_key|private_key)" \
        "$PROJECT_ROOT" \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude-dir=security-reports \
        > "$PROJECT_ROOT/security-reports/secret-patterns.txt" 2>&1 || true
    
    log_success "Secret scanning completed"
}

# Generate security report
generate_report() {
    log_info "Generating security report..."
    
    local report_file="$PROJECT_ROOT/security-reports/security-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# WriteWave Security Scan Report

**Generated:** $(date)
**Environment:** $ENVIRONMENT
**Scan Type:** $SCAN_TYPE

## Summary

This report contains the results of security scans performed on the WriteWave application.

## Scan Results

### Code Security
- **Semgrep:** See \`semgrep-report.json\`
- **Bandit:** See \`bandit-report.txt\`
- **ESLint Security:** See individual service reports

### Container Security
- **Trivy Base Images:** See \`trivy-*.json\` files
- **Trivy Application Images:** See \`trivy-*-service.json\` files
- **Dockerfile Analysis:** See \`dockerfile-scan.txt\`

### Infrastructure Security
- **Terraform:** See \`terraform-scan.json\`
- **Kubernetes:** See \`kubernetes-scan.json\`
- **Helm Charts:** See \`helm-*-scan.json\` files

### Dependency Security
- **Node.js:** See \`npm-audit-*.txt\` and \`npm-audit-*.json\` files
- **Python:** See \`python-safety.txt\`
- **Go:** See \`gosec-*.json\` files

### Secret Detection
- **GitLeaks:** See \`gitleaks-report.json\`
- **TruffleHog:** See \`trufflehog-report.txt\`
- **Pattern Matching:** See \`secret-patterns.txt\`

## Recommendations

1. **High Priority:** Address any critical vulnerabilities immediately
2. **Medium Priority:** Plan remediation for moderate vulnerabilities
3. **Low Priority:** Monitor and address low-severity issues
4. **Dependencies:** Keep all dependencies updated
5. **Secrets:** Ensure no secrets are committed to version control

## Next Steps

1. Review all scan results
2. Prioritize vulnerabilities by severity
3. Create remediation plan
4. Implement fixes
5. Re-run scans to verify fixes

EOF
    
    log_success "Security report generated: $report_file"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Remove temporary scan files if needed
    find "$PROJECT_ROOT" -name "*.tmp" -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Main scanning function
run_scans() {
    log_info "Starting security scans..."
    
    # Create reports directory
    mkdir -p "$PROJECT_ROOT/security-reports"
    
    case "$SCAN_TYPE" in
        "all")
            scan_code
            scan_containers
            scan_infrastructure
            scan_dependencies
            scan_secrets
            ;;
        "code")
            scan_code
            ;;
        "container")
            scan_containers
            ;;
        "infrastructure")
            scan_infrastructure
            ;;
        "dependencies")
            scan_dependencies
            ;;
        "secrets")
            scan_secrets
            ;;
        *)
            log_error "Unknown scan type: $SCAN_TYPE"
            exit 1
            ;;
    esac
    
    generate_report
    
    log_success "Security scans completed successfully!"
}

# Error handling
trap cleanup EXIT

# Main execution
main() {
    log_info "WriteWave Security Scanning Script"
    log_info "Scan Type: $SCAN_TYPE"
    log_info "Environment: $ENVIRONMENT"
    
    validate_scan_type
    check_prerequisites
    
    run_scans
    
    log_success "Script completed successfully!"
}

# Help function
show_help() {
    cat << EOF
WriteWave Security Scanning Script

Usage: $0 <scan-type> [environment]

Arguments:
  scan-type     Type of scan to perform (all|code|container|infrastructure|dependencies|secrets)
  environment   Target environment (development|staging|production) [default: development]

Examples:
  $0 all
  $0 code production
  $0 container
  $0 dependencies staging

EOF
}

# Check if help is requested
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    show_help
    exit 0
fi

# Check if minimum arguments are provided
if [[ $# -lt 1 ]]; then
    log_error "Missing required arguments"
    show_help
    exit 1
fi

# Run main function
main "$@"
