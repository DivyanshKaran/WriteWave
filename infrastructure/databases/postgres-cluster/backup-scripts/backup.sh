#!/bin/bash

# PostgreSQL Backup Script for WriteWave Microservices
# ====================================================

set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=${RETENTION_DAYS:-30}
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/postgres-backup.log"

# Database configurations
declare -A DATABASES=(
    ["writewave_users"]="postgres-user-primary:5432"
    ["writewave_content"]="postgres-content-primary:5432"
    ["writewave_progress"]="postgres-progress-primary:5432"
    ["writewave_community"]="postgres-community-primary:5432"
    ["writewave_analytics"]="postgres-analytics-primary:5432"
)

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"/{full,wal,restore}

# Function to perform full backup
full_backup() {
    local db_name=$1
    local host_port=$2
    local host=${host_port%:*}
    local port=${host_port#*:}
    
    log "Starting full backup for $db_name from $host:$port"
    
    local backup_file="$BACKUP_DIR/full/${db_name}_${DATE}.sql"
    local backup_file_compressed="$backup_file.gz"
    
    # Perform pg_dump
    if pg_dump -h "$host" -p "$port" -U postgres -d "$db_name" \
        --verbose --no-password --format=custom --compress=9 \
        --file="$backup_file_compressed" 2>>"$LOG_FILE"; then
        
        log "Full backup completed for $db_name: $backup_file_compressed"
        
        # Create restore script
        cat > "$BACKUP_DIR/restore/${db_name}_restore.sh" << EOF
#!/bin/bash
# Restore script for $db_name
# Usage: ./${db_name}_restore.sh [target_host] [target_port]

TARGET_HOST=\${1:-$host}
TARGET_PORT=\${2:-$port}
BACKUP_FILE="$backup_file_compressed"

echo "Restoring $db_name to \$TARGET_HOST:\$TARGET_PORT"
echo "Backup file: \$BACKUP_FILE"

# Drop and recreate database
psql -h "\$TARGET_HOST" -p "\$TARGET_PORT" -U postgres -c "DROP DATABASE IF EXISTS $db_name;"
psql -h "\$TARGET_HOST" -p "\$TARGET_PORT" -U postgres -c "CREATE DATABASE $db_name;"

# Restore database
pg_restore -h "\$TARGET_HOST" -p "\$TARGET_PORT" -U postgres -d "$db_name" \
    --verbose --no-password --clean --if-exists "\$BACKUP_FILE"

echo "Restore completed for $db_name"
EOF
        chmod +x "$BACKUP_DIR/restore/${db_name}_restore.sh"
        
    else
        error_exit "Full backup failed for $db_name"
    fi
}

# Function to perform WAL archiving
wal_archive() {
    local db_name=$1
    local host_port=$2
    local host=${host_port%:*}
    local port=${host_port#*:}
    
    log "Starting WAL archiving for $db_name from $host:$port"
    
    # Create WAL archive directory
    mkdir -p "$BACKUP_DIR/wal/$db_name"
    
    # Enable WAL archiving
    psql -h "$host" -p "$port" -U postgres -d "$db_name" -c "
        ALTER SYSTEM SET archive_mode = on;
        ALTER SYSTEM SET archive_command = 'test ! -f $BACKUP_DIR/wal/$db_name/%f && cp %p $BACKUP_DIR/wal/$db_name/%f';
        SELECT pg_reload_conf();
    " 2>>"$LOG_FILE"
    
    log "WAL archiving enabled for $db_name"
}

# Function to perform point-in-time recovery
pitr_recovery() {
    local db_name=$1
    local target_time=$2
    local target_host=${3:-"localhost"}
    local target_port=${4:-5432}
    
    log "Starting PITR recovery for $db_name to $target_time"
    
    # Create recovery configuration
    cat > "$BACKUP_DIR/restore/${db_name}_pitr_recovery.conf" << EOF
# Point-in-time recovery configuration for $db_name
restore_command = 'cp $BACKUP_DIR/wal/$db_name/%f %p'
recovery_target_time = '$target_time'
recovery_target_timeline = 'latest'
EOF
    
    log "PITR recovery configuration created for $db_name"
    log "To perform recovery, use the configuration file: $BACKUP_DIR/restore/${db_name}_pitr_recovery.conf"
}

# Function to clean old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days"
    
    # Clean full backups
    find "$BACKUP_DIR/full" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Clean WAL archives
    find "$BACKUP_DIR/wal" -name "*.wal" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Clean restore scripts
    find "$BACKUP_DIR/restore" -name "*_restore.sh" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log "Cleanup completed"
}

# Function to verify backup integrity
verify_backup() {
    local backup_file=$1
    local db_name=$2
    
    log "Verifying backup integrity for $backup_file"
    
    if pg_restore --list "$backup_file" >/dev/null 2>&1; then
        log "Backup verification successful for $db_name"
        return 0
    else
        log "Backup verification failed for $db_name"
        return 1
    fi
}

# Function to get backup statistics
backup_stats() {
    log "Backup Statistics:"
    log "=================="
    
    for db_name in "${!DATABASES[@]}"; do
        local backup_count=$(find "$BACKUP_DIR/full" -name "${db_name}_*.sql.gz" -type f | wc -l)
        local latest_backup=$(find "$BACKUP_DIR/full" -name "${db_name}_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        local backup_size=$(du -sh "$BACKUP_DIR/full" 2>/dev/null | cut -f1 || echo "0")
        
        log "Database: $db_name"
        log "  Backup count: $backup_count"
        log "  Latest backup: $latest_backup"
        log "  Total size: $backup_size"
    done
    
    log "=================="
}

# Main backup process
main() {
    log "Starting backup process at $(date)"
    
    # Perform full backups for all databases
    for db_name in "${!DATABASES[@]}"; do
        full_backup "$db_name" "${DATABASES[$db_name]}"
        wal_archive "$db_name" "${DATABASES[$db_name]}"
    done
    
    # Verify all backups
    for backup_file in "$BACKUP_DIR/full"/*.sql.gz; do
        if [[ -f "$backup_file" ]]; then
            db_name=$(basename "$backup_file" | cut -d'_' -f1-2)
            verify_backup "$backup_file" "$db_name"
        fi
    done
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Show statistics
    backup_stats
    
    log "Backup process completed at $(date)"
}

# Handle command line arguments
case "${1:-backup}" in
    "backup")
        main
        ;;
    "restore")
        if [[ $# -lt 2 ]]; then
            error_exit "Usage: $0 restore <database_name> [target_host] [target_port]"
        fi
        db_name=$2
        target_host=${3:-"localhost"}
        target_port=${4:-5432}
        
        restore_script="$BACKUP_DIR/restore/${db_name}_restore.sh"
        if [[ -f "$restore_script" ]]; then
            log "Executing restore script for $db_name"
            "$restore_script" "$target_host" "$target_port"
        else
            error_exit "Restore script not found: $restore_script"
        fi
        ;;
    "pitr")
        if [[ $# -lt 3 ]]; then
            error_exit "Usage: $0 pitr <database_name> <target_time> [target_host] [target_port]"
        fi
        db_name=$2
        target_time=$3
        target_host=${4:-"localhost"}
        target_port=${5:-5432}
        
        pitr_recovery "$db_name" "$target_time" "$target_host" "$target_port"
        ;;
    "stats")
        backup_stats
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|restore|pitr|stats|cleanup}"
        echo ""
        echo "Commands:"
        echo "  backup                    - Perform full backup of all databases"
        echo "  restore <db> [host] [port] - Restore specific database"
        echo "  pitr <db> <time> [host] [port] - Point-in-time recovery"
        echo "  stats                     - Show backup statistics"
        echo "  cleanup                   - Clean old backups"
        exit 1
        ;;
esac
