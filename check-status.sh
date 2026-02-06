#!/bin/bash
echo "Checking Nginx Status..."
sudo systemctl status nginx | head -n 10

echo "Checking Ports..."
sudo ss -tuln | grep -E ':(80|443)'

echo "Checking Nginx Config..."
cat /etc/nginx/sites-enabled/finansys
echo "Checking Certificate SAN/CN..."
DOMAIN="${1:-finansys.site}"
echo "Domain: $DOMAIN"
openssl s_client -connect "${DOMAIN}:443" -servername "${DOMAIN}" -showcerts </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
