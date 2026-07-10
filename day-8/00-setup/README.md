# Module 00 — Setup & Prerequisites

**Duration:** 30 minutes
**Goal:** Every laptop can (a) run Redis, (b) run a TypeScript file, (c) ping Redis from Node.

If you finish early, help a neighbour — nobody moves to Module 01 until everyone's `PONG` works.

---

## 0.1 Verify base tools

Open a new **PowerShell** (Windows) or **Terminal** (macOS/Linux) and run each check:

```powershell
node -v      # expect v20.x or newer
npm -v       # expect 10.x or newer
docker -v    # expect Docker version 24.x or newer
git --version
code -v
```

If any command is missing, install from:

| Tool           | Link                                                     |
|----------------|----------------------------------------------------------|
| Node.js 20 LTS | https://nodejs.org/en/download                           |
| Docker Desktop | https://www.docker.com/products/docker-desktop           |
| Git            | https://git-scm.com/downloads                            |
| VS Code        | https://code.visualstudio.com/download                   |

**Stop and fix any missing tool before continuing.**

---

## 0.2 Start Redis

You have two options — pick **A** unless Docker refuses to start, then use **B**.

### Option A — Docker (recommended, offline-friendly)

```powershell
docker run -d --name redis-training -p 6379:6379 redis:7-alpine
```

Verify:

```powershell
docker ps                           # should list redis-training
docker exec -it redis-training redis-cli ping
# PONG
```

Stop / start later:

```powershell
docker stop redis-training
docker start redis-training
```

### Option B — Redis Cloud free tier

1. Sign up at https://redis.io/try-free/.
2. Create a **Free 30 MB** database in any region.
3. Copy the **public endpoint** (looks like `redis-12345.c1.us-east.ec2.cloud.redislabs.com:12345`) and the **default user password**.
4. Note them — you'll paste them into `.env` files.

You will use a connection string like:

```
redis://default:<PASSWORD>@<HOST>:<PORT>
```

---

## 0.3 Concept map for the day

```mermaid
flowchart TB
    subgraph "Slow path"
        C1[Client] --> S1[Express]
        S1 --> DB1[(DB / external API<br/>~50-500 ms)]
    end
    subgraph "Fast path"
        C2[Client] --> S2[Express]
        S2 --> R[(Redis<br/>~1 ms)]
        R -. miss .-> DB2[(DB)]
        DB2 -. warm .-> R
    end
    C2 -.->|blocked when noisy| RL[Rate Limiter<br/>on Redis]
    S2 --> P[Profiler<br/>autocannon + clinic]
    P --> AI[AI review<br/>Copilot + ChatGPT]
    AI --> ME[Us: better cache keys<br/>+ smarter TTLs]
```

Keep this picture in your head. **Every module fills in one box.**

---

## 0.4 Smoke test — first TypeScript + Redis ping

You'll create a tiny throwaway project just to prove your setup works.

```powershell
# from the 00-setup folder
cd 00-setup
mkdir smoketest
cd smoketest

npm init -y
npm install ioredis
npm install -D typescript ts-node @types/node
npx tsc --init --rootDir src --outDir dist --target ES2022 --module commonjs --esModuleInterop true --strict true
mkdir src
```

Create `src/ping.ts`:

```ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

async function main() {
  const reply = await redis.ping();
  console.log("Redis says:", reply); // PONG

  await redis.set("greeting", "hello, redis");
  const value = await redis.get("greeting");
  console.log("greeting =", value);

  await redis.quit();
}

main().catch((err) => {
  console.error("Redis smoke test failed:", err);
  process.exit(1);
});
```

Run:

```powershell
npx ts-node src/ping.ts
```

Expected output:

```
Redis says: PONG
greeting = hello, redis
```

If you used **Option B (Redis Cloud)**:

```powershell
$env:REDIS_URL="redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT"
npx ts-node src/ping.ts
```

---

## 0.5 VS Code — enable Copilot Chat and the REST Client

1. Click the Copilot icon in the sidebar → sign in with your GitHub account.
2. Open Command Palette → **`Chat: Focus on Chat View`** → say hi to Copilot.
3. Install the **REST Client** extension (`humao.rest-client`). You'll use `.http` files instead of Postman.

Verify REST Client works — create `00-setup/smoketest/scratch.http`:

```http
### Google homepage — just proves the REST Client works
GET https://www.google.com
```

Click **Send Request** above the line. You should see a response in a new tab.

---

## 0.6 Activity — team roll call (5 min)

Each participant, in one sentence:

> "I got `PONG` on **[Docker / Redis Cloud]** and I ran the TS ping on **[Windows / macOS / Linux]**."

Trainer notes any environment quirks on a whiteboard.

---

## 0.7 AI reflection prompt

Paste this into ChatGPT / Claude and read the answer — you'll refer back to it in Module 05.

> **Prompt:**
>
> "I'm about to start a 1-day training on Redis caching, rate limiting, and AI-assisted performance profiling with Node.js and TypeScript. I know TypeScript basics but nothing about Redis. Give me a 6-item glossary (in plain English, no jargon) of the terms I'll meet today: **cache-aside, cache miss, TTL, eviction, rate limiter, flamegraph**. One sentence each, plus one 'when it hurts' example each."

Save the reply into `00-setup/notes.md`. You'll build on this file all day.

---

## Done? ✅

- Node, npm, Docker, VS Code all report versions.
- `docker exec redis-training redis-cli ping` returns `PONG` **or** you can connect to Redis Cloud.
- `npx ts-node src/ping.ts` prints `PONG` and `greeting = hello, redis`.
- Copilot Chat is signed in; REST Client extension is installed.

➡ Move on to [../01-redis-fundamentals/README.md](../01-redis-fundamentals/README.md).
