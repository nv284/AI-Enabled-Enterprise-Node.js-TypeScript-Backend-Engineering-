# SETUP — Prerequisites & Environment

Get this working **before Day 1**. Budget 30–45 minutes.

---

## 1. Prerequisites (knowledge)

You should already be comfortable with:

- Basic JavaScript (variables, functions, `async`/`await`, arrays, objects).
- Running `npm install` and `npm run <script>` from a terminal.
- Reading an HTTP request/response.
- Using `git clone` and `git commit`.

You do **not** need prior TypeScript, Express, or testing experience — we teach the minimum along the way.

---

## 2. Tools to install

| Tool | Version | Why |
|---|---|---|
| **Node.js** | ≥ 20.10 | Runtime. Includes `npm`. |
| **VS Code** | latest | Editor + AI chat |
| **Git** | any recent | Version control |
| **GitHub Copilot** *(or another AI chat)* | — | For Modules 8–9 |

### Verify

```powershell
node --version   # v20.x or newer
npm --version    # 10.x or newer
git --version
```

### VS Code extensions (recommended)

- `dbaeumer.vscode-eslint`
- `esbenp.prettier-vscode`
- `orta.vscode-jest` *(optional — we use Vitest but the runner UI is nice)*
- `github.copilot` *(or your preferred AI assistant)*

---

## 3. Project scaffold — one-time

Every case study version has its own folder with its own `package.json`. To install everything in one go from the repo root:

```powershell
# from the training repo root
Get-ChildItem -Path case-study -Directory | ForEach-Object {
  Push-Location $_.FullName
  if (Test-Path package.json) { npm install }
  Pop-Location
}
```

Or install per-version as you get to it — each version's `README.md` says `npm install` first.

---

## 4. What each case study version needs

All 6 versions share the same runtime deps (declared per-folder so each version is standalone):

```jsonc
// dependencies
"express": "^4.19.0",
"better-sqlite3": "^11.0.0",
"zod": "^3.23.0"

// devDependencies
"typescript": "^5.4.0",
"@types/node": "^20.11.0",
"@types/express": "^4.17.0",
"tsx": "^4.7.0",
"vitest": "^1.5.0",
"eslint": "^8.57.0",
"@typescript-eslint/parser": "^7.0.0",
"@typescript-eslint/eslint-plugin": "^7.0.0"

// v5 + v6 add
"tsyringe": "^4.8.0",
"reflect-metadata": "^0.2.0"

// v6 adds (dev)
"madge": "^7.0.0",
"dependency-cruiser": "^16.0.0"
```

> **Windows tip:** `better-sqlite3` is a native module. If `npm install` fails, install the *Windows Build Tools* once with `npm install --global windows-build-tools` (older Node) or ensure you have Visual Studio Build Tools with the *Desktop development with C++* workload.

---

## 5. Repository conventions

- **Absolute imports** are not used — plain relative imports keep things simple for freshers.
- **`src/`** always holds source. **`tests/`** always holds tests.
- **`npm run dev`** starts the API on `http://localhost:3000`.
- **`npm test`** runs Vitest.

---

## 6. AI assistant — how we use it

Modules 8 and 9 use an AI chat (Copilot, ChatGPT, Claude — any capable one). You'll paste prompts from [prompts/](prompts/) into your chat panel.

**Ground rule:** *AI is a reviewer, not an oracle.* Every suggestion is a hypothesis you verify with code, tests, and tools.

---

## 7. Sanity check

Once you finish this setup, run:

```powershell
cd case-study/v1-messy-monolith
npm install
npm run dev
```

Then in a second terminal:

```powershell
curl http://localhost:3000/health
# expected: {"status":"ok"}
```

If that works, you are ready. Head to [modules/01-introduction-to-architecture.md](modules/01-introduction-to-architecture.md).
