#!/bin/bash

echo "🔄 Installing dependencies..."
npm install

echo "🗄️  Generating Prisma Client..."
npx prisma generate

echo "📦 Building application..."
npm run build

echo "🚀 Running database migrations..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set - skipping migrations"
  echo "   Migrations will need to be run manually or after database is connected"
else
  npx prisma migrate deploy || echo "⚠️  Migrations failed - database may not be ready yet"
fi

echo "✅ Build complete!"
