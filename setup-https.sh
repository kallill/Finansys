#!/bin/bash
set -e

# Configurações
APP_PORT=3000
DOMAIN_OR_IP="172.184.250.242"
SSL_DIR="/etc/nginx/ssl"

echo "--- Iniciando Configuração HTTPS (Nginx Proxy) ---"

# 1. Instalar Nginx
echo "1. Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 2. Gerar Certificado Auto-assinado (Self-Signed)
echo "2. Gerando Certificado SSL Auto-assinado para $DOMAIN_OR_IP..."
sudo mkdir -p $SSL_DIR
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/selfsigned.key \
    -out $SSL_DIR/selfsigned.crt \
    -subj "/C=BR/ST=SP/L=SaoPaulo/O=Finansys/OU=IT/CN=$DOMAIN_OR_IP"

# 3. Configurar Nginx
echo "3. Configurando Proxy Reverso no Nginx..."

# Criar arquivo de configuração do site
sudo bash -c "cat > /etc/nginx/sites-available/finansys" <<EOF
server {
    listen 80;
    server_name $DOMAIN_OR_IP;
    # Redirecionar HTTP para HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_OR_IP;

    ssl_certificate $SSL_DIR/selfsigned.crt;
    ssl_certificate_key $SSL_DIR/selfsigned.key;

    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Headers para passar o IP real para o Node.js
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Habilitar o site
echo "4. Ativando configurações..."
sudo ln -sf /etc/nginx/sites-available/finansys /etc/nginx/sites-enabled/
# Remover default se existir para evitar conflitos
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e Reiniciar Nginx
echo "5. Reiniciando Nginx..."
sudo nginx -t
sudo systemctl restart nginx

# 6. Configurar Firewall (UFW)
echo "6. Configurando Firewall (UFW)..."
# Tenta habilitar UFW se estiver instalado
if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 3000
    sudo ufw allow 22
    # Nota: Não ativamos o ufw forçadamente (ufw enable) para não bloquear o SSH se algo der errado, 
    # mas liberamos as regras caso ele já esteja ativo.
    echo "Regras de firewall atualizadas."
else
    echo "UFW não encontrado. Certifique-se de que as portas 80 e 443 estão abertas no Painel da Cloud (Azure/AWS)."
fi

echo "--- Concluído! ---"
echo "Acesse agora: https://$DOMAIN_OR_IP"
echo "(Aceite o aviso de segurança do navegador pois o certificado é auto-assinado)"
