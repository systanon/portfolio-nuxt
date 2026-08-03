#!/bin/bash
set -euo pipefail

docker rm -f nuxt_app 2>/dev/null || true

docker build -t nuxt-ssr-app .

docker run -d \
  --name nuxt_app \
  -p 3001:3001 \
  --env-file nuxt.env \
  --restart unless-stopped \
  nuxt-ssr-app

docker network connect go-backend_default nuxt_app
