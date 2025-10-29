#!/bin/bash

# ============================================================================
# PRODUCTION-ORIENTED SCRIPT - API Gateway (Kong)
# ============================================================================
# This script is NOT intended for local development without Docker.
# For local development, skip Kong and call backend services directly.
# For production/staging, use infrastructure/docker-compose or Kubernetes manifests.
# ============================================================================

set -e

YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}This script is production-oriented and requires Docker.${NC}"
echo -e "${YELLOW}For LOCAL development, do not run Kong. Hit services directly (e.g., http://localhost:8001 for user-service).${NC}"
echo -e "${YELLOW}To deploy Kong in non-local environments, see:${NC}"
echo -e " - infrastructure/docker-compose.yml (full stack)"
echo -e " - backend/kong/docker-compose.*.yml (env-specific)"
echo -e " - infrastructure/kubernetes/* (Kubernetes)"

exit 0

