#!/usr/bin/env bash
# Освобождает порт 3001 (часто занят предыдущим next dev) и запускает dev-сервер.
set -e
cd "$(dirname "$0")/.."
for p in $(lsof -ti tcp:3001 2>/dev/null); do
  kill -9 "$p" 2>/dev/null || true
done
./node_modules/.bin/prisma generate
exec ./node_modules/.bin/next dev -p 3001
