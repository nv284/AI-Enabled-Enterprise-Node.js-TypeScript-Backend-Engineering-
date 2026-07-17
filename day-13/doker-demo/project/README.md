# todo-api — sample project for the Docker training

A minimal Express + TypeScript REST API. Nothing fancy — the point is to have real code to containerize.

## Endpoints

| Method | Path      | Body                | Response |
|--------|-----------|---------------------|----------|
| GET    | `/health` | —                   | `{ status: "ok", uptime: 123 }` |
| GET    | `/todos`  | —                   | `Todo[]` |
| POST   | `/todos`  | `{ "title": "..." }`| `Todo` (201) |

## Run locally (no Docker)

```bash
npm install
npm run dev            # ts-node-dev with hot reload
# or
npm run build && npm start
```

Then hit it:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/todos
curl -X POST http://localhost:3000/todos -H "content-type: application/json" -d "{\"title\":\"buy milk\"}"
```

## Run in Docker

Three Dockerfiles ship with this project, one per module:

```bash
# Module 3 — naive
docker build -f Dockerfile.v1-basic     -t todo-api:v1 .

# Module 4 — multi-stage
docker build -f Dockerfile.v2-multistage -t todo-api:v2 .

# Module 5 — final optimized (default Dockerfile)
docker build -t todo-api:latest .

docker run --rm -p 3000:3000 todo-api:latest
```

Compare sizes:

```bash
docker images todo-api
```

You should see roughly:

```
todo-api   v1        ~1.2 GB
todo-api   v2        ~180 MB
todo-api   latest    ~180 MB   (same base, extra hardening)
```
