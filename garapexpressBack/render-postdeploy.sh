#!/bin/bash
# Post-deploy script for Render - run migrations after service is live

echo "🔄 Post-deploy: Running Prisma migrations..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set!"
  echo "Please set DATABASE_URL environment variable in Render dashboard"
  exit 1
fi

npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migrations may have issues - check logs"
  exit 1
fi
