#!/bin/bash
# IOPIC Dynamic Trust Anchor Synchronization
# Keeps fail2ban whitelists synchronized with a roaming administrative node.

# 1. Define your Dynamic DNS Hostname and target jails
DDNS_HOST="your-roaming-node.duckdns.org"
# Define multiple jails as a bash array
JAILS=("nginx-limit-req" "sshd")
CACHE_FILE="/tmp/iopic_trust_anchor.ip"

# 2. Resolve the current IP of the hostname (requires 'dnsutils' or 'bind-tools' installed on host)
CURRENT_IP=$(dig +short "$DDNS_HOST" | tail -n1)

if [ -z "$CURRENT_IP" ]; then
    echo "⚠️ SIGHTING FAILED: Could not resolve $DDNS_HOST"
    exit 1
fi

# 3. Compare with the previously grounded state
if [ -f "$CACHE_FILE" ]; then
    OLD_IP=$(cat "$CACHE_FILE")
    if [ "$OLD_IP" == "$CURRENT_IP" ]; then
        # Systemic Symmetry maintained. No changes required.
        exit 0
    fi
    
    # 4. If the IP has shifted, purge the old IP from all fail2ban jails
    echo "SIGHTING: Administrative node shift detected. Purging old coordinates ($OLD_IP)..."
    for JAIL in "${JAILS[@]}"; do
        fail2ban-client set "$JAIL" delignoreip "$OLD_IP" > /dev/null
    done
fi

# 5. Inject the new IP into all fail2ban whitelists and update the cache
for JAIL in "${JAILS[@]}"; do
    echo "SIGHTING: Injecting new Trust Anchor coordinates ($CURRENT_IP) into $JAIL..."
    fail2ban-client set "$JAIL" addignoreip "$CURRENT_IP" > /dev/null
done

# Ground the new state
echo "$CURRENT_IP" > "$CACHE_FILE"

echo "✅ SYMMETRY ACHIEVED: Trust Anchor synchronized at 8.09V."
