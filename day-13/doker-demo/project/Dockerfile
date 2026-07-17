# Final optimized Dockerfile (Module 5 output)
#
# Additions over v2:
#   - Non-root user (least-privilege).
#   - HEALTHCHECK so orchestrators know when the app is ready.
#   - `dumb-init` as PID 1 for correct signal forwarding.
#   - Explicit `--production=false` in build stage, `--omit=dev` after.
#   - Deterministic tag on base image (pin by digest is even better in real prod).
#
# Build: docker build -t todo-api:latest .
# Run:   docker run --rm -p 3000:3000 todo-api:latest

# ---------- Stage 1: builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build \
 && npm prune --omit=dev

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime

# dumb-init: tiny init that forwards SIGTERM etc. to Node.
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Copy runtime artifacts owned by the node user that ships in the base image.
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node package.json ./

# Drop root.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+ (process.env.PORT||3000) +'/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
