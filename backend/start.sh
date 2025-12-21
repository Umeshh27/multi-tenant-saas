#!/bin/sh

echo "Running database migrations..."
node scripts/runMigrations.js

echo "Running seed data..."
node scripts/runSeeds.js

echo "Starting backend server..."
npm run start
