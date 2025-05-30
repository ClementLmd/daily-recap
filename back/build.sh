#!/usr/bin/env bash
# Install pnpm
npm install -g pnpm@9.1.0

# Install dependencies
cd /opt/render/project/src/back
pnpm install

# Build the application
pnpm build 