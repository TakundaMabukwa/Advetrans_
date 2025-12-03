#!/bin/bash
# Deploy script - Build locally and upload to server

SERVER="root@your-server-ip"
REMOTE_PATH="~/Advetrans_"

echo "Building locally..."
npm run build

echo "Creating deployment package..."
tar -czf deploy.tar.gz .next package.json package-lock.json next.config.js public

echo "Uploading to server..."
scp deploy.tar.gz $SERVER:$REMOTE_PATH/

echo "Deploying on server..."
ssh $SERVER << 'EOF'
cd ~/Advetrans_
tar -xzf deploy.tar.gz
rm deploy.tar.gz
pm2 restart advetrans
EOF

echo "Cleaning up..."
rm deploy.tar.gz

echo "Deployment complete!"
