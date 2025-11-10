#!/bin/bash
echo "=== Building Smart Recycling Frontend ==="

# الانتقال لمجلد frontend
cd frontend

echo "1. Installing dependencies..."
npm install --legacy-peer-deps

echo "2. Building application..."
npm run build

echo "3. Build completed successfully!"
echo "=== Frontend is ready ==="