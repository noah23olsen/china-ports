#!/bin/bash

# Usage: bash run.sh dev   # for development
#        bash run.sh prod  # for production

set -e

if [ "$1" = "dev" ]; then
  echo "=== Starting in DEVELOPMENT mode ==="
  # Start Flask backend
  echo "Starting Flask backend..."
  cd backend
  source venv/bin/activate
  FLASK_PID=""
  python app.py &
  FLASK_PID=$!
  cd ../frontend
  echo "Starting Vue (Vite) frontend..."
  npm install
  npm run dev
  # When you stop the script, kill Flask
  trap "kill $FLASK_PID" EXIT
elif [ "$1" = "prod" ]; then
  echo "=== Building frontend and starting in PRODUCTION mode ==="
  cd frontend
  npm install
  npm run build
  cd ../backend
  source venv/bin/activate
  python app.py
else
  echo "Usage: bash run.sh dev   # for development"
  echo "       bash run.sh prod  # for production"
  exit 1
fi 