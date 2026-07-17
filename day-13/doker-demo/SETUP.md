# Setup & Prerequisites

> Complete this **before** the training. Budget ~30 minutes if you're starting from scratch.

## 1. Required software

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | 20 LTS or newer | Run the sample app locally |
| **npm** | ships with Node | Install dependencies |
| **Docker Desktop** | latest | Build and run containers |
| **VS Code** | latest | Editor |
| **GitHub Copilot** extension | latest | We'll use it in every module |
| **Git** | any recent | Optional but recommended |

### Windows install (recommended)

Open **PowerShell as Administrator** and run:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Docker.DockerDesktop
winget install Microsoft.VisualStudioCode
winget install Git.Git
```

After Docker Desktop installs, **reboot**, then launch Docker Desktop once and wait for the whale icon in the tray to stop animating.

### macOS install

```bash
brew install node
brew install --cask docker
brew install --cask visual-studio-code
```

### Linux (Ubuntu/Debian)

Follow the [official Docker Engine install guide](https://docs.docker.com/engine/install/ubuntu/) — Docker Desktop is optional on Linux; the engine + CLI is enough. Add your user to the `docker` group so you don't need `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 2. Verify your install

Open a **new** terminal (important — new PATH) and run each command. Copy the output — you'll paste it into chat at the start of class if something is off.

```bash
node --version        # v20.x.x or higher
npm --version         # 10.x or higher
docker --version      # Docker version 24.x or higher
docker run hello-world
code --version
```

The `docker run hello-world` command **must** print `Hello from Docker!`. If it doesn't, Docker isn't running — open Docker Desktop.

## 3. VS Code extensions

Install these from the Extensions panel (`Ctrl+Shift+X`):

- **GitHub Copilot** (`GitHub.copilot`)
- **GitHub Copilot Chat** (`GitHub.copilot-chat`)
- **Docker** (`ms-azuretools.vscode-docker`) — syntax highlighting + linting for Dockerfiles
- **ESLint** (`dbaeumer.vscode-eslint`) — optional

## 4. Get the training folder

The training project lives under `project/`. If you cloned this repo, you're done. Otherwise download and extract to any folder — but the path **should not contain spaces** if possible, and **must not contain characters like `:` or `?`**.

## 5. Warm up the Docker cache (optional, saves time in class)

Pre-pull the base images we'll use so the first `docker build` isn't slow:

```bash
docker pull node:20-alpine
docker pull node:20-slim
docker pull gcr.io/distroless/nodejs20-debian12
```

## 6. Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: command not found` | Docker Desktop isn't running, or you didn't open a new terminal after install. |
| `error during connect: ... pipe/docker_engine` (Windows) | Start Docker Desktop and wait for the whale icon. |
| `permission denied` on `docker` (Linux) | You skipped `usermod -aG docker $USER` and re-login. |
| `EACCES` on npm install | Never `sudo npm install`. Reinstall Node via nvm or the winget installer. |
| Copilot not suggesting | Sign in via the account icon (bottom-left in VS Code) → GitHub. |

## Ready check

Before class, all four of these should be true:

- [ ] `node --version` shows 20+
- [ ] `docker run hello-world` prints the success message
- [ ] Copilot Chat opens with `Ctrl+Alt+I` and responds to "hi"
- [ ] You can open the `project/` folder in VS Code
