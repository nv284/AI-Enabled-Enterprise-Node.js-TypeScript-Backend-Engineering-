# Module 5 — Container optimization

**Duration:** 20 min &nbsp;•&nbsp; **Format:** hands-on + Copilot prompts

## Learning goals

- Apply the **six most impactful** optimizations to a Node.js container.
- Understand why each matters (size, speed, security).
- Read the final production-ready `Dockerfile` and know why each line exists.

---

## The optimization checklist

For any Node.js backend service, in priority order:

1. ✅ **Multi-stage build** — done in Module 4.
2. ✅ **Small base image** — `node:20-alpine` or distroless.
3. **`.dockerignore`** — don't ship what you don't need.
4. **Layer caching order** — lockfiles before source.
5. **Non-root user** — drop root inside the container.
6. **Correct signal handling** — respect SIGTERM (needed for graceful K8s shutdowns).
7. **HEALTHCHECK** — let the platform know when you're ready.

Let's do 3–7 now.

---

## 1. `.dockerignore` (3 min)

Without it, `COPY . .` copies `node_modules/`, `.git/`, `.env`, and everything else — slowing builds and risking leaked secrets.

Create `project/.dockerignore`:

```gitignore
node_modules
dist
npm-debug.log*
.git
.gitignore
.vscode
.idea
.DS_Store
Thumbs.db
.env
.env.*
!.env.example
coverage
*.log
Dockerfile*
.dockerignore
docker-compose*.yml
README.md
*.md
```

**Rule:** if it's in `.gitignore`, it almost certainly belongs in `.dockerignore` too. And add build/CI files on top.

Rebuild v2 with the ignore file in place — the "Sending build context to Docker daemon" line at the start should be tiny (KB, not MB).

## 2. Layer caching order (already done in v2)

Recap: put stable, rarely-changing things first, volatile things last. For Node:

```
1. FROM
2. WORKDIR
3. COPY package*.json .
4. RUN npm ci
5. COPY source
6. RUN build
```

Steps 1–4 are cached across every code change. Only 5–6 rebuild.

## 3. Non-root user (5 min)

The official `node` image already ships a `node` user (UID 1000). Use it.

```dockerfile
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
```

Two things:

- `--chown=node:node` on every `COPY` — otherwise files land as root and the `node` user can't write to them (e.g. logs, temp files).
- `USER node` **after** the copies, so the copies themselves run as root.

Verify it worked:

```bash
docker build -t todo-api:latest .
docker run --rm todo-api:latest whoami
# → node
```

## 4. Signal handling with `dumb-init` (5 min)

When Kubernetes wants to stop your pod, it sends **SIGTERM** to PID 1 in the container. If PID 1 is a shell (`sh -c "node dist/index.js"`) it may **not forward** the signal to Node, and the pod gets forcefully killed 30 seconds later with SIGKILL. Bad.

Two fixes (either works):

**Option A — exec-form CMD** (simple):

```dockerfile
CMD ["node", "dist/index.js"]
```

The bracket form runs `node` as PID 1 directly. No shell wrapper.

**Option B — `dumb-init`** (more robust, needed if you have any shell wrappers):

```dockerfile
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

`dumb-init` is a 20 KB init that forwards signals correctly. Our final `Dockerfile` uses both — bracket form AND dumb-init — belt and suspenders.

Also make sure your Node code handles the signal (already done in `src/index.ts`):

```typescript
process.on('SIGTERM', () => shutdown('SIGTERM'));
```

## 5. HEALTHCHECK (3 min)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+ (process.env.PORT||3000) +'/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"
```

- We use `node -e` instead of `curl` because Alpine doesn't ship curl and we don't want to add it just for a health check.
- Kubernetes uses its own liveness/readiness probes and often ignores Docker's HEALTHCHECK — but it's still useful for `docker ps`, Docker Compose, and simpler runtimes.

## 6. Put it all together (2 min)

Look at `project/Dockerfile` (the default, no `.v*` suffix). Every line has a reason:

```dockerfile
FROM node:20-alpine AS builder          # small base
WORKDIR /app
COPY package*.json ./                   # cache-friendly layer order
RUN npm ci                              # deterministic install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build \
 && npm prune --omit=dev                # drop devDeps before stage 2 copies them

FROM node:20-alpine AS runtime
RUN apk add --no-cache dumb-init        # correct signal handling
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node package.json ./
USER node                               # non-root
EXPOSE 3000
HEALTHCHECK ...                         # readiness
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

Build and confirm:

```bash
docker build -t todo-api:latest .
docker images todo-api
docker run --rm -p 3000:3000 todo-api:latest
curl http://localhost:3000/health
```

---

## Optional: distroless (challenge)

For extra credit, swap the runtime stage to `gcr.io/distroless/nodejs20-debian12`. It has no shell, no package manager, no `apk`, no `dumb-init` needed (Node runs as PID 1 correctly).

```dockerfile
FROM gcr.io/distroless/nodejs20-debian12 AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
USER nonroot
EXPOSE 3000
CMD ["dist/index.js"]
```

Trade-off: **you can't `docker exec sh` into it to debug** — there's no shell. That's a feature for prod, a pain for learning.

---

## Copilot prompts to try

Paste any of these into Copilot Chat. Compare outputs to the checklist above.

> Review this Dockerfile and suggest optimizations for a Node.js production image. Prioritize by impact and explain each suggestion in one line. [paste Dockerfile.v2-multistage]

> Add a non-root user, a HEALTHCHECK, and proper signal handling to this Dockerfile. Use `node:20-alpine`. [paste Dockerfile.v2-multistage]

> Generate a `.dockerignore` for a Node.js + TypeScript project that uses npm and outputs to `dist/`.

> Rewrite this Dockerfile to use a distroless runtime stage. Point out what I lose by doing this.

> Explain why running a container as root is a security issue, and what the practical attack looks like if my Node app has an RCE vulnerability.

### Anatomy of a good optimization prompt

Notice the pattern:

1. **Context** — "this Dockerfile", pasted inline.
2. **Goal** — "optimize for production" / "reduce size" / "harden".
3. **Constraints** — "use `node:20-alpine`", "keep npm as package manager".
4. **Format** — "as a bullet list", "explain each in one line".

Copy this pattern when writing your own prompts later.

---

**Next:** [Module 6 — Kubernetes concepts](06-kubernetes-concepts.md)
