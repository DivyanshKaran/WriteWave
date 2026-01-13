#!/bin/bash

# Script to generate secure secrets for WriteWave application
# Usage: ./scripts/generate-secrets.sh

set -e

echo "==================================="
echo "WriteWave Secret Generator"
echo "==================================="
echo ""

# Function to generate a secure random string
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to generate a strong password
generate_password() {
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-48
}

echo "Generating secure secrets..."
echo ""

echo "# Generated Secrets - $(date)"
echo "# IMPORTANT: Store these securely and never commit to version control!"
echo ""

echo "# JWT Secrets"
echo "JWT_SECRET=$(generate_secret)"
echo "JWT_REFRESH_SECRET=$(generate_secret)"
echo ""

echo "# Database Passwords"
echo "POSTGRES_PASSWORD=$(generate_password)"
echo "POSTGRES_REPLICATION_PASSWORD=$(generate_password)"
echo "CLICKHOUSE_PASSWORD=$(generate_password)"
echo "REDIS_PASSWORD=$(generate_password)"
echo ""

echo "# Message Queue"
echo "RABBITMQ_PASSWORD=$(generate_password)"
echo "RABBITMQ_ERLANG_COOKIE=$(generate_secret)"
echo ""

echo "# Object Storage"
echo "MINIO_ACCESS_KEY=$(generate_secret)"
echo "MINIO_SECRET_KEY=$(generate_password)"
echo ""

echo "# API Keys (one per service)"
echo "API_KEY_USER_SERVICE=$(generate_secret)"
echo "API_KEY_CONTENT_SERVICE=$(generate_secret)"
echo "API_KEY_PROGRESS_SERVICE=$(generate_secret)"
echo "API_KEY_COMMUNITY_SERVICE=$(generate_secret)"
echo "API_KEY_NOTIFICATION_SERVICE=$(generate_secret)"
echo "API_KEY_ANALYTICS_SERVICE=$(generate_secret)"
echo "API_KEY_ARTICLES_SERVICE=$(generate_secret)"
echo ""

echo "# Monitoring"
echo "GRAFANA_PASSWORD=$(generate_password)"
echo ""

echo "==================================="
echo "Secrets generated successfully!"
echo "==================================="
echo ""
echo "IMPORTANT SECURITY NOTES:"
echo "1. Copy these secrets to your .env file"
echo "2. Store a backup in a secure password manager"
echo "3. Never commit .env files to version control"
echo "4. Rotate secrets regularly (every 90 days)"
echo "5. Use different secrets for each environment"
echo ""
