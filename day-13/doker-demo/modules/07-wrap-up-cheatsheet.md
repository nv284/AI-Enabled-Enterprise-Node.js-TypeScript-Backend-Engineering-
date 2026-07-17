# Module 7 — Wrap-up & cheatsheet

**Duration:** 10 min &nbsp;•&nbsp; **Format:** recap

## What you learned today

- What a container is and why it's different from a VM.
- The Docker client/daemon/registry architecture and the 10 commands you'll actually use.
- How to write a Dockerfile for a Node.js + TypeScript backend.
- How to convert it to a **multi-stage build** and cut image size by ~85%.
- Six production optimizations: small base, `.dockerignore`, layer order, non-root, signals, HEALTHCHECK.
- The Kubernetes vocabulary (Pod, Deployment, Service, ConfigMap, Secret, Ingress) and how our containerized image fits into a cluster.

## Docker cheatsheet

```bash
# Build
docker build -t app:tag .
docker build -f Dockerfile.dev -t app:dev .
docker build --no-cache -t app:tag .          # force fresh build

# Run
docker run --rm -p 3000:3000 app:tag
docker run -d --name api -p 3000:3000 app:tag
docker run --rm -it app:tag sh                # override CMD, get a shell
docker run --rm -e NODE_ENV=production app:tag

# Inspect
docker ps                                     # running
docker ps -a                                  # all
docker logs -f api                            # tail logs
docker exec -it api sh                        # shell into running container
docker inspect api                            # full JSON
docker stats                                  # live CPU/mem

# Images
docker images
docker image inspect app:tag
docker rmi app:tag
docker tag app:tag ghcr.io/me/app:1.0.0
docker push ghcr.io/me/app:1.0.0

# Cleanup
docker stop api && docker rm api
docker system prune -f                        # dangling images/containers
docker system prune -af --volumes             # NUKE everything (careful)
```

## Dockerfile template (steal this)

Use this as your starting point for any Node.js + TypeScript service:

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

## `.dockerignore` template

```gitignore
node_modules
dist
.git
.env
.env.*
!.env.example
coverage
*.log
Dockerfile*
.dockerignore
README.md
*.md
.vscode
.idea
```

## Optimization checklist

Print this. Tick every box before you ship an image.

- [ ] Multi-stage build (builder → runtime)
- [ ] Base image is `alpine`, `slim`, or `distroless`
- [ ] `.dockerignore` present and complete
- [ ] `package*.json` copied before source (cache-friendly)
- [ ] `npm ci` used, not `npm install`
- [ ] `npm prune --omit=dev` (or equivalent) before final stage
- [ ] Runs as non-root user
- [ ] CMD uses exec form (`["node", "..."]`, not `node ...`)
- [ ] HEALTHCHECK defined
- [ ] Explicit `EXPOSE`
- [ ] Base image tag pinned (not `latest`)
- [ ] Image size checked (`docker images`)
- [ ] Image tested end-to-end (`curl /health`)

## Common Copilot prompts, in your pocket

Save these in a personal note. They cover 80% of Docker chores.

- *"Write a Dockerfile for a [language] [framework] app that [does X]. Use multi-stage. Use [base image]. Non-root. HEALTHCHECK on [path]."*
- *"Review this Dockerfile for size, security, and cache efficiency. Rank suggestions by impact."*
- *"Convert this single-stage Dockerfile into a multi-stage one. [paste]"*
- *"Generate a `.dockerignore` for a [language] project using [tool]."*
- *"Explain what each line of this Dockerfile does. [paste]"*
- *"My container starts but exits immediately. Given this Dockerfile and this `docker logs` output, what's wrong?"*
- *"Generate a Kubernetes Deployment + Service YAML for image [X], N replicas, /health probes, resources [Y]."*

## Where to go next

Ordered by usefulness for a backend engineer:

1. **Docker Compose** — orchestrate multiple containers (API + Postgres + Redis) with one file. 1-hour learning curve.
2. **CI pipelines that build and push images** — GitHub Actions has a first-class Docker workflow.
3. **BuildKit + build cache mounts** — `RUN --mount=type=cache,target=/root/.npm npm ci` makes rebuilds fly.
4. **Hands-on Kubernetes** — install `kind` or `k3d`, deploy the YAML from Module 6.
5. **Helm** — templated Kubernetes manifests. Once you have >5 K8s YAML files, you'll want it.
6. **OpenTelemetry + structured logging** — so `docker logs` and K8s log aggregation are actually useful.
7. **Trivy / Snyk / `docker scout`** — automated vulnerability scanning of your images.

## Feedback

You just did a lot in 2 hours. Write down:

- One thing that clicked.
- One thing that's still fuzzy.
- One question for the trainer.

That's the fastest way to lock in what you learned.
