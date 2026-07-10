# Setup & Prerequisites

Complete these steps **before Day 1**. Plan for **~30 minutes**.

---

## 1. Install core tools

| Tool | Version | Check with |
|---|---|---|
| Node.js | ≥ 20 LTS | `node -v` |
| npm | ≥ 10 | `npm -v` |
| Git | any recent | `git --version` |
| VS Code | latest | `code -v` |

- Node.js: https://nodejs.org/en/download
- Git: https://git-scm.com/downloads
- VS Code: https://code.visualstudio.com/

## 2. Recommended VS Code extensions

- **GitHub Copilot** + **GitHub Copilot Chat** (used in Module 5)
- **ESLint**
- **Prettier - Code formatter**
- **Prisma**
- **REST Client** (or install **Postman** / **Insomnia** separately)
- **DotENV**

Install from VS Code marketplace or run:

```powershell
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension Prisma.prisma
code --install-extension humao.rest-client
code --install-extension mikestead.dotenv
```

## 3. Global npm packages

```powershell
npm i -g tsx typescript
```

- `tsx` lets us run TypeScript files directly (no compile step during learning).
- `typescript` gives us `tsc` for type checks.

## 4. Optional but recommended

### Docker Desktop
Only needed if you want to run a local Postgres or Keycloak later. **Not required for the base course** (we use SQLite).
https://www.docker.com/products/docker-desktop

### Semgrep (Module 5)

**Option A — Python (works everywhere):**
```powershell
pip install semgrep
semgrep --version
```

**Option B — Docker (no Python needed):**
```powershell
docker pull returntocorp/semgrep
```

### Snyk CLI (Module 5, optional)
```powershell
npm i -g snyk
snyk auth   # free account
```

## 5. Google Cloud project for OAuth (Module 3)

You need OAuth 2.0 Client credentials from Google. **Free — no billing needed.**

1. Go to https://console.cloud.google.com/ and sign in.
2. Create a new project called `security-training`.
3. In the left menu: **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `Security Training`
   - User support email: your email
   - Developer contact: your email
   - Save. On the **Test users** step, add your own Google account.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `security-training-local`
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback`
   - Create.
5. Copy the **Client ID** and **Client secret** — you will paste them into `project/.env` on Day 1.

> **Do not commit these secrets.** They live only in your local `.env` file.

## 6. Verify your setup

Create a scratch folder and run:

```powershell
mkdir setup-check
cd setup-check
npm init -y
npm i -D typescript tsx @types/node
npx tsc --init
echo "console.log('Node', process.version)" > check.ts
npx tsx check.ts
```

You should see:
```
Node v20.x.x
```

Delete the `setup-check` folder afterwards.

## 7. Clone the training repo

If your trainer provides a repo URL, clone it. Otherwise, work directly inside this folder.

```powershell
cd "C:\Data\OneDrive - bookstruck1\GenAI\security"
```

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `tsx: command not found` | Restart terminal after `npm i -g tsx`, or use `npx tsx` |
| Port 3000 already in use | `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess` then stop it |
| Google OAuth: `redirect_uri_mismatch` | Ensure the URI in Google Console is **exactly** `http://localhost:3000/auth/google/callback` |
| Copilot Chat not available | Sign in via VS Code Command Palette → `GitHub: Sign in` |

You are ready. See [AGENDA.md](AGENDA.md).
