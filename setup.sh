#!/bin/bash
set -e

echo "Checking environment..."

# Install Node.js if missing
if ! command -v node &> /dev/null
then
    echo "Node.js not found. Installing..."
    # Assuming Ubuntu/Debian
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Extracting files..."
tar -xzf finansys-deploy.tar.gz

echo "Installing backend dependencies..."
cd backend
npm install

echo "Building backend..."
npm run build

echo "Starting application..."
# Check if PM2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found. Installing via npm..."
    sudo npm install -g pm2
fi

pm2 start dist/server.js --name "finansys" || pm2 restart finansys
pm2 save

echo "Deployment complete! Application running on port 3000."
