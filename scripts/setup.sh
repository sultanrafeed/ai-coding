#!/usr/bin/env bash
set -euo pipefail

echo "Setting up AI Coding Platform..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "node not found"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm not found — run: npm i -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker not found"; exit 1; }
command -v uv >/dev/null 2>&1 || { echo "uv not found — run: curl -Ls https://astral.sh/uv/install.sh | sh"; exit 1; }

# JS dependencies
echo "Installing JS dependencies..."
pnpm install

# Python dependencies
echo "Installing Python dependencies..."
cd apps/ai && uv sync && cd ../..

# Copy env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — fill in your API keys"
fi

# Start infrastructure
echo "Starting Docker services..."
docker compose up -d postgres redis qdrant litellm

echo "Done. Run 'pnpm dev' to start development servers."
