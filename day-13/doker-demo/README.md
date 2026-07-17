# Docker & Kubernetes for Backend Services

> A 2-hour hands-on training for freshers comfortable with TypeScript. You'll containerize a real Node.js + TypeScript REST API, write and optimize Dockerfiles with multi-stage builds, and learn Kubernetes fundamentals conceptually.

---

## Who this is for

- Developers new to Docker and containers
- Comfortable reading and writing basic TypeScript / Node.js
- Have used the terminal before (`cd`, `ls`, `npm install`)
- Using **VS Code + GitHub Copilot** (we'll use Copilot heavily)

## What you'll build

A minimal Express REST API (`GET /health`, `GET /todos`, `POST /todos`) that you will:

1. Run locally with Node.
2. Containerize with a **basic Dockerfile**.
3. Refactor to a **multi-stage build**.
4. Optimize (small image, non-root user, layer caching, `.dockerignore`).
5. Understand how it would be deployed to **Kubernetes** (concepts only).

## Agenda (120 min)

| # | Module | Time | Format |
|---|--------|------|--------|
| 1 | [Container fundamentals](modules/01-containers-fundamentals.md) | 10 min | Concept + diagrams |
| 2 | [Docker basics](modules/02-docker-basics.md) | 15 min | Concept + CLI demo |
| 3 | [Your first Dockerfile (Node + TS)](modules/03-dockerfile-nodejs-ts.md) | 25 min | Hands-on |
| 4 | [Multi-stage builds](modules/04-multistage-builds.md) | 20 min | Hands-on |
| 5 | [Container optimization](modules/05-optimization.md) | 20 min | Hands-on + prompts |
| 6 | [Kubernetes concepts](modules/06-kubernetes-concepts.md) | 20 min | Concept + diagrams |
| 7 | [Wrap-up & cheatsheet](modules/07-wrap-up-cheatsheet.md) | 10 min | Recap |

## Repo layout

```
.
├── README.md              ← you are here
├── SETUP.md               ← install this BEFORE class
├── modules/               ← 7 module markdowns
├── project/               ← the sample app you'll dockerize
│   ├── src/               ← Express + TypeScript source
│   ├── Dockerfile.v1-basic       ← Module 3 output
│   ├── Dockerfile.v2-multistage  ← Module 4 output
│   └── Dockerfile                ← Module 5 final optimized
└── diagrams/              ← reference mermaid diagrams
```

## Before class starts

Complete **every step** in [SETUP.md](SETUP.md). Verifying installs during class wastes everyone's time.

## How to use Copilot in this course

Every module has a **"Copilot prompts"** box. Open Copilot Chat in VS Code (`Ctrl+Alt+I`) and paste the prompt. Read the answer, compare with the reference solution in the module, and only then copy code. Prompts are training wheels — the goal is that by module 7 you can write them yourself.
