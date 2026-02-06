#!/bin/bash
set -e
DOMAIN="finansys.site"
ALT_DOMAIN="www.finansys.site"
APP_PORT="${APP_PORT:-3000}"
EMAIL="${EMAIL:-admin@finansys.site}"
CONF="/etc/nginx/sites-available/finansys"
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo bash -c "cat > /tmp/finansys.nginx" <<'EOF'
server {
    listen 80;
    server_name finansys.site www.finansys.site;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo mv /tmp/finansys.nginx "$CONF"
sudo ln -sf "$CONF" /etc/nginx/sites-enabled/finansys
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d "$DOMAIN" -d "$ALT_DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
sudo systemctl reload nginx
sudo systemctl enable --now certbot.timer
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 'Nginx Full'
  sudo ufw allow 3000
fi
echo "LetsEncrypt OK for $DOMAIN"
