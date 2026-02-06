#!/bin/bash
echo "Checking SSL Directory..."
ls -la /etc/nginx/ssl/
echo "---NGINX CONFIG---"
cat /etc/nginx/sites-enabled/finansys
echo "---NGINX TEST---"
sudo nginx -t
echo "---CURL HTTPS---"
curl -k -I https://localhost
echo "---CURL APP---"
curl -I http://localhost:3000
