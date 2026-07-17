# Setup & Prerequisites

Do all of this **before** the session. Total setup time: ~20 min on a clean machine.

---

## 1. Accounts

| What | Why | Link |
|------|-----|------|
| GitHub account | Host repo + run Actions | https://github.com/join |
| GitHub Copilot (Free, Pro, or Business) | Module 4 (AI-assisted) | https://github.com/features/copilot |

> Copilot Free tier is enough for this training.

---

## 2. Local tools

Install these in order. Versions listed are the **minimum** — newer is fine.

### 2.1 Git
- Windows: https://git-scm.com/download/win
- Verify:
  ```powershell
  git --version   # git version 2.40+
  ```

### 2.2 Node.js 20 LTS
- Installer: https://nodejs.org/en/download
- Verify:
  ```powershell
  node --version   # v20.x
  npm --version    # 10.x
  ```

### 2.3 VS Code
- https://code.visualstudio.com/
- Required extensions:
  | Extension | Publisher | ID |
  |-----------|-----------|----|
  | GitHub Copilot | GitHub | `GitHub.copilot` |
  | GitHub Copilot Chat | GitHub | `GitHub.copilot-chat` |
  | GitHub Actions | GitHub | `GitHub.vscode-github-actions` |
  | YAML | Red Hat | `redhat.vscode-yaml` |
  | ESLint | Microsoft | `dbaeumer.vscode-eslint` |

Install them all in one shot from a PowerShell terminal:
```powershell
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
code --install-extension GitHub.vscode-github-actions
code --install-extension redhat.vscode-yaml
code --install-extension dbaeumer.vscode-eslint
```

### 2.4 GitHub CLI (optional but recommended)
- https://cli.github.com/
- Verify + login:
  ```powershell
  gh --version
  gh auth login          # choose GitHub.com, HTTPS, browser
  ```

---

## 3. Configure Git identity

```powershell
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

---

## 4. Sanity check

Run this in PowerShell — if all four print a version, you're ready:
```powershell
git --version; node --version; npm --version; gh --version
```

---

## 5. Sign in inside VS Code

1. Open VS Code.
2. Click the **Accounts** icon (bottom-left) → **Sign in with GitHub to use Copilot**.
3. Confirm Copilot Chat panel opens: `Ctrl+Alt+I`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm` not found after Node install | Restart the terminal / VS Code. |
| Copilot Chat panel is empty | Ensure both `GitHub.copilot` **and** `GitHub.copilot-chat` are installed, then reload window (`Ctrl+Shift+P` → *Developer: Reload Window*). |
| `gh auth login` opens wrong browser | Copy the URL it prints and paste it in your preferred browser. |
| Corporate proxy blocks GitHub | Set `HTTP_PROXY` / `HTTPS_PROXY` env vars before `gh auth login`. |

You're done — head to [modules/00-overview.md](modules/00-overview.md).
