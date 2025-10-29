#!/bin/bash

# ============================================================================
# kill-listeners.sh - Free up WriteWave project ports
# This script kills processes running on WriteWave service ports to clear them
# for local development. Focuses on project-specific ports only.
# ============================================================================

set -eu

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# WriteWave service ports (add more as needed)
PROJECT_PORTS=(8000 8001 8002 8003 8004 8005 8006 3000 5432 5433 5434 5435 5436 5437 6379 7001 9092 9093 9094 2181 8080 8123 9000)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WriteWave Port Cleaner${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Ensure sudo privileges (prompts for password)
echo -e "${YELLOW}Requesting sudo privileges...${NC}"
sudo -v
echo ""

# Collect PIDs using any of the project ports
echo -e "${YELLOW}Checking project ports for active processes...${NC}"

# Use an array to collect unique PIDs
declare -a ALL_PIDS
declare -a FOUND_PORTS

for port in "${PROJECT_PORTS[@]}"; do
	# Check if port is in use
	# Handle PIDs that might be on multiple lines
	while IFS= read -r pid; do
		if [ -n "$pid" ] && [ "$pid" != "1" ]; then
			# Add PID if not already in array
			if [[ ! " ${ALL_PIDS[@]} " =~ " ${pid} " ]]; then
				ALL_PIDS+=("$pid")
				FOUND_PORTS+=("$port")
			fi
		fi
	done < <(sudo lsof -t -i:$port 2>/dev/null || true)
done

# Check if there are any processes to kill
if [ ${#ALL_PIDS[@]} -eq 0 ]; then
	echo -e "${GREEN}✓ No processes found on WriteWave project ports.${NC}"
	exit 0
fi

# Display what will be killed
echo -e "${YELLOW}Found processes on project ports:${NC}"
for i in "${!ALL_PIDS[@]}"; do
	pid="${ALL_PIDS[$i]}"
	port="${FOUND_PORTS[$i]}"
	echo -e "  PID $pid on port $port"
done

echo ""
echo -e "${YELLOW}Processes to kill:${NC}"
for pid in "${ALL_PIDS[@]}"; do
	COMM="$(ps -o comm= -p "$pid" 2>/dev/null || echo 'unknown')"
	echo -e "  PID=$pid CMD=$COMM"
done
echo ""

# Confirm
echo -e "${RED}WARNING:${NC} This will kill ALL processes on WriteWave project ports."
echo -e "Type ${RED}YES${NC} to proceed: "
read -r CONFIRM

if [ "$CONFIRM" != "YES" ]; then
	echo -e "${YELLOW}Aborted by user.${NC}"
	exit 1
fi

# Kill processes
FAILED=0
KILLED=0
for pid in "${ALL_PIDS[@]}"; do
	if sudo kill -9 "$pid" 2>/dev/null; then
		echo -e "${GREEN}✓ Killed PID $pid${NC}"
		KILLED=$((KILLED+1))
	else
		echo -e "${RED}✗ Failed to kill PID $pid${NC}"
		FAILED=$((FAILED+1))
	fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
if [ "$FAILED" -eq 0 ]; then
	echo -e "${GREEN}✓ Successfully killed $KILLED process(es)${NC}"
	echo -e "${GREEN}✓ WriteWave project ports are now free${NC}"
	echo -e "${BLUE}========================================${NC}"
	exit 0
else
	echo -e "${YELLOW}Killed $KILLED process(es) with $FAILED failure(s)${NC}"
	echo -e "${BLUE}========================================${NC}"
	exit 2
fi
