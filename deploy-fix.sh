#!/bin/bash
set -e

echo "Deploying frontend fix..."

# Garantir que o diretório de destino existe (o Express serve ../../frontend/dist)
DEST_DIR="/home/kallil_lopes/frontend/dist"
echo "Creating destination directory: $DEST_DIR"
mkdir -p "$DEST_DIR"

# Copiar os arquivos
if [ -d "frontend/dist" ]; then
    echo "Copying dist files..."
    # Usar cp -rT para copiar o CONTEÚDO de dist para dentro da pasta destino
    # ou cp -r frontend/dist/* ...
    cp -r frontend/dist/* "$DEST_DIR/"
else
    echo "Error: frontend/dist not found in current directory!"
    ls -la
    exit 1
fi

echo "Restarting application..."
pm2 restart finansys

echo "Fix deployed successfully!"
