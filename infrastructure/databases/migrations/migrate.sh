#!/bin/bash

# Database Migration Management System for WriteWave Microservices
# ================================================================

set -euo pipefail

# Configuration
MIGRATIONS_DIR="/migrations"
LOG_FILE="/var/log/migrations.log"
LOCK_FILE="/tmp/migrations.lock"

# Database configurations
declare -A DATABASES=(
    ["user-service"]="postgres-user-primary:5432:writewave_users"
    ["content-service"]="postgres-content-primary:5432:writewave_content"
    ["progress-service"]="postgres-progress-primary:5432:writewave_progress"
    ["community-service"]="postgres-community-primary:5432:writewave_community"
    ["analytics-service"]="postgres-analytics-primary:5432:writewave_analytics"
)

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    rm -f "$LOCK_FILE"
    exit 1
}

# Lock management
acquire_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local pid=$(cat "$LOCK_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            error_exit "Migration already running (PID: $pid)"
        else
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
}

release_lock() {
    rm -f "$LOCK_FILE"
}

# Function to create migration table
create_migration_table() {
    local host_port_db=$1
    local host=${host_port_db%:*:*}
    local port_db=${host_port_db#*:}
    local port=${port_db%:*}
    local db=${port_db#*:}
    
    log "Creating migration table for $db"
    
    psql -h "$host" -p "$port" -U postgres -d "$db" -c "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            version VARCHAR(255) NOT NULL UNIQUE,
            service VARCHAR(100) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            checksum VARCHAR(64) NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            execution_time INTEGER,
            status VARCHAR(20) DEFAULT 'success'
        );
        
        CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
        CREATE INDEX IF NOT EXISTS idx_schema_migrations_service ON schema_migrations(service);
    " 2>>"$LOG_FILE"
}

# Function to get applied migrations
get_applied_migrations() {
    local host_port_db=$1
    local service=$2
    local host=${host_port_db%:*:*}
    local port_db=${host_port_db#*:}
    local port=${port_db%:*}
    local db=${port_db#*:}
    
    psql -h "$host" -p "$port" -U postgres -d "$db" -t -c "
        SELECT version FROM schema_migrations 
        WHERE service = '$service' 
        ORDER BY version;
    " 2>/dev/null | tr -d ' ' | grep -v '^$' || true
}

# Function to calculate file checksum
calculate_checksum() {
    local file=$1
    sha256sum "$file" | cut -d' ' -f1
}

# Function to apply migration
apply_migration() {
    local service=$1
    local migration_file=$2
    local host_port_db=$3
    local host=${host_port_db%:*:*}
    local port_db=${host_port_db#*:}
    local port=${port_db%:*}
    local db=${port_db#*:}
    
    local filename=$(basename "$migration_file")
    local version=$(echo "$filename" | cut -d'_' -f1)
    local checksum=$(calculate_checksum "$migration_file")
    
    log "Applying migration $filename for $service"
    
    local start_time=$(date +%s)
    local status="success"
    local error_message=""
    
    # Start transaction
    psql -h "$host" -p "$port" -U postgres -d "$db" -c "BEGIN;" 2>>"$LOG_FILE"
    
    if psql -h "$host" -p "$port" -U postgres -d "$db" -f "$migration_file" 2>>"$LOG_FILE"; then
        # Record successful migration
        local end_time=$(date +%s)
        local execution_time=$((end_time - start_time))
        
        psql -h "$host" -p "$port" -U postgres -d "$db" -c "
            INSERT INTO schema_migrations (version, service, filename, checksum, execution_time, status)
            VALUES ('$version', '$service', '$filename', '$checksum', $execution_time, 'success');
        " 2>>"$LOG_FILE"
        
        psql -h "$host" -p "$port" -U postgres -d "$db" -c "COMMIT;" 2>>"$LOG_FILE"
        
        log "Migration $filename applied successfully in ${execution_time}s"
    else
        # Record failed migration
        local end_time=$(date +%s)
        local execution_time=$((end_time - start_time))
        error_message=$(tail -5 "$LOG_FILE" | tr '\n' ' ')
        
        psql -h "$host" -p "$port" -U postgres -d "$db" -c "
            INSERT INTO schema_migrations (version, service, filename, checksum, execution_time, status)
            VALUES ('$version', '$service', '$filename', '$checksum', $execution_time, 'failed');
        " 2>>"$LOG_FILE"
        
        psql -h "$host" -p "$port" -U postgres -d "$db" -c "ROLLBACK;" 2>>"$LOG_FILE"
        
        error_exit "Migration $filename failed: $error_message"
    fi
}

# Function to rollback migration
rollback_migration() {
    local service=$1
    local version=$2
    local host_port_db=$3
    local host=${host_port_db%:*:*}
    local port_db=${host_port_db#*:}
    local port=${port_db%:*}
    local db=${port_db#*:}
    
    log "Rolling back migration $version for $service"
    
    # Find rollback file
    local rollback_file=$(find "$MIGRATIONS_DIR/$service" -name "${version}_*_rollback.sql" | head -1)
    
    if [[ -z "$rollback_file" ]]; then
        error_exit "Rollback file not found for version $version"
    fi
    
    local start_time=$(date +%s)
    
    # Start transaction
    psql -h "$host" -p "$port" -U postgres -d "$db" -c "BEGIN;" 2>>"$LOG_FILE"
    
    if psql -h "$host" -p "$port" -U postgres -d "$db" -f "$rollback_file" 2>>"$LOG_FILE"; then
        # Remove migration record
        psql -h "$host" -p "$port" -U postgres -d "$db" -c "
            DELETE FROM schema_migrations WHERE version = '$version' AND service = '$service';
        " 2>>"$LOG_FILE"
        
        psql -h "$host" -p "$port" -U postgres -d "$db" -c "COMMIT;" 2>>"$LOG_FILE"
        
        local end_time=$(date +%s)
        local execution_time=$((end_time - start_time))
        
        log "Migration $version rolled back successfully in ${execution_time}s"
    else
        psql -h "$host" -p "$port" -U postgres -d "$db" -c "ROLLBACK;" 2>>"$LOG_FILE"
        error_exit "Rollback failed for version $version"
    fi
}

# Function to validate migration files
validate_migrations() {
    local service=$1
    
    log "Validating migration files for $service"
    
    local migration_dir="$MIGRATIONS_DIR/$service"
    if [[ ! -d "$migration_dir" ]]; then
        log "No migration directory found for $service"
        return 0
    fi
    
    local errors=0
    
    # Check for duplicate versions
    local versions=$(find "$migration_dir" -name "*.sql" -not -name "*_rollback.sql" | xargs -I {} basename {} | cut -d'_' -f1 | sort)
    local duplicate_versions=$(echo "$versions" | uniq -d)
    
    if [[ -n "$duplicate_versions" ]]; then
        log "ERROR: Duplicate migration versions found: $duplicate_versions"
        ((errors++))
    fi
    
    # Check for missing rollback files
    for migration_file in "$migration_dir"/*.sql; do
        if [[ -f "$migration_file" && ! "$migration_file" =~ _rollback\.sql$ ]]; then
            local version=$(basename "$migration_file" | cut -d'_' -f1)
            local rollback_file="${migration_file%.sql}_rollback.sql"
            
            if [[ ! -f "$rollback_file" ]]; then
                log "WARNING: No rollback file found for $migration_file"
            fi
        fi
    done
    
    # Check SQL syntax
    for migration_file in "$migration_dir"/*.sql; do
        if [[ -f "$migration_file" ]]; then
            if ! psql --dry-run -f "$migration_file" 2>/dev/null; then
                log "ERROR: SQL syntax error in $migration_file"
                ((errors++))
            fi
        fi
    done
    
    if [[ $errors -eq 0 ]]; then
        log "Migration validation passed for $service"
        return 0
    else
        log "Migration validation failed for $service with $errors errors"
        return 1
    fi
}

# Function to get migration status
get_migration_status() {
    local service=$1
    local host_port_db=${DATABASES[$service]}
    
    log "Migration status for $service:"
    log "================================"
    
    local applied_migrations=$(get_applied_migrations "$host_port_db" "$service")
    local migration_dir="$MIGRATIONS_DIR/$service"
    
    if [[ -d "$migration_dir" ]]; then
        local available_migrations=$(find "$migration_dir" -name "*.sql" -not -name "*_rollback.sql" | xargs -I {} basename {} | cut -d'_' -f1 | sort)
        
        log "Applied migrations:"
        echo "$applied_migrations" | while read -r version; do
            if [[ -n "$version" ]]; then
                log "  ✓ $version"
            fi
        done
        
        log "Pending migrations:"
        echo "$available_migrations" | while read -r version; do
            if [[ -n "$version" && ! "$applied_migrations" =~ $version ]]; then
                log "  ○ $version"
            fi
        done
    else
        log "No migration directory found for $service"
    fi
    
    log "================================"
}

# Function to run migrations for a service
run_migrations() {
    local service=$1
    local host_port_db=${DATABASES[$service]}
    local host=${host_port_db%:*:*}
    local port_db=${host_port_db#*:}
    local port=${port_db%:*}
    local db=${port_db#*:}
    
    log "Running migrations for $service"
    
    # Create migration table
    create_migration_table "$host_port_db"
    
    # Validate migrations
    if ! validate_migrations "$service"; then
        error_exit "Migration validation failed for $service"
    fi
    
    # Get applied migrations
    local applied_migrations=$(get_applied_migrations "$host_port_db" "$service")
    
    # Find pending migrations
    local migration_dir="$MIGRATIONS_DIR/$service"
    if [[ ! -d "$migration_dir" ]]; then
        log "No migration directory found for $service"
        return 0
    fi
    
    local pending_migrations=()
    for migration_file in "$migration_dir"/*.sql; do
        if [[ -f "$migration_file" && ! "$migration_file" =~ _rollback\.sql$ ]]; then
            local version=$(basename "$migration_file" | cut -d'_' -f1)
            if [[ ! "$applied_migrations" =~ $version ]]; then
                pending_migrations+=("$migration_file")
            fi
        fi
    done
    
    # Sort migrations by version
    IFS=$'\n' pending_migrations=($(sort <<<"${pending_migrations[*]}"))
    unset IFS
    
    # Apply pending migrations
    for migration_file in "${pending_migrations[@]}"; do
        apply_migration "$service" "$migration_file" "$host_port_db"
    done
    
    log "All migrations completed for $service"
}

# Function to run all migrations
run_all_migrations() {
    log "Running migrations for all services"
    
    for service in "${!DATABASES[@]}"; do
        run_migrations "$service"
    done
    
    log "All service migrations completed"
}

# Function to create new migration
create_migration() {
    local service=$1
    local name=$2
    local version=$(date +%Y%m%d%H%M%S)
    
    local migration_dir="$MIGRATIONS_DIR/$service"
    mkdir -p "$migration_dir"
    
    local migration_file="$migration_dir/${version}_${name}.sql"
    local rollback_file="$migration_dir/${version}_${name}_rollback.sql"
    
    # Create migration file
    cat > "$migration_file" << EOF
-- Migration: $name
-- Version: $version
-- Service: $service
-- Created: $(date)

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example_table (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Add indexes if needed
-- CREATE INDEX idx_example_table_name ON example_table(name);

-- Add constraints if needed
-- ALTER TABLE example_table ADD CONSTRAINT chk_name_length CHECK (length(name) > 0);
EOF

    # Create rollback file
    cat > "$rollback_file" << EOF
-- Rollback Migration: $name
-- Version: $version
-- Service: $service
-- Created: $(date)

-- Add your rollback SQL here
-- Example:
-- DROP TABLE IF EXISTS example_table;
EOF

    log "Created migration files:"
    log "  Migration: $migration_file"
    log "  Rollback:  $rollback_file"
}

# Main function
main() {
    acquire_lock
    
    case "${1:-help}" in
        "migrate")
            if [[ $# -eq 1 ]]; then
                run_all_migrations
            else
                run_migrations "$2"
            fi
            ;;
        "rollback")
            if [[ $# -lt 3 ]]; then
                error_exit "Usage: $0 rollback <service> <version>"
            fi
            local host_port_db=${DATABASES[$2]}
            rollback_migration "$2" "$3" "$host_port_db"
            ;;
        "status")
            if [[ $# -eq 1 ]]; then
                for service in "${!DATABASES[@]}"; do
                    get_migration_status "$service"
                done
            else
                get_migration_status "$2"
            fi
            ;;
        "validate")
            if [[ $# -eq 1 ]]; then
                for service in "${!DATABASES[@]}"; do
                    validate_migrations "$service"
                done
            else
                validate_migrations "$2"
            fi
            ;;
        "create")
            if [[ $# -lt 3 ]]; then
                error_exit "Usage: $0 create <service> <migration_name>"
            fi
            create_migration "$2" "$3"
            ;;
        "help"|*)
            echo "Database Migration Management System"
            echo "===================================="
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  migrate [service]     - Run migrations (all services or specific service)"
            echo "  rollback <service> <version> - Rollback specific migration"
            echo "  status [service]      - Show migration status"
            echo "  validate [service]    - Validate migration files"
            echo "  create <service> <name> - Create new migration"
            echo "  help                  - Show this help"
            echo ""
            echo "Services:"
            for service in "${!DATABASES[@]}"; do
                echo "  - $service"
            done
            ;;
    esac
    
    release_lock
}

# Handle script termination
trap 'release_lock' EXIT

# Run main function
main "$@"
