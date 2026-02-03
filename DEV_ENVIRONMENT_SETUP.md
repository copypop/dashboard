# CAAT Dashboard - Development Environment Setup

## Prerequisites

Install these on your machine before starting:

1. **Docker Desktop** - https://www.docker.com/products/docker-desktop/
2. **VS Code** - https://code.visualstudio.com/
3. **VS Code Extensions** (install from the Extensions sidebar):
   - **Dev Containers** (`ms-vscode-remote.remote-containers`) - required
   - **Docker** (`ms-azuretools.vscode-docker`) - recommended
   - **GitHub Copilot** (`GitHub.copilot`) - optional, requires license

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/CAAT-GrowthMarketing/dashboard.git
cd dashboard
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and set:

```
VITE_DASHBOARD_PASSWORD_HASH=your_password_hash_here
CLAUDE_API_KEY=your_claude_api_key_here
NODE_ENV=development
DASHBOARD_API_KEY=your_api_key_here
```

### 3. Open in VS Code Dev Container

1. Open VS Code
2. Open the project folder (`File > Open Folder` and select the cloned `dashboard` folder)
3. VS Code will detect the `.devcontainer` folder and show a popup in the bottom-right:
   **"Folder contains a Dev Container configuration file. Reopen folder to develop in a container."**
4. Click **"Reopen in Container"**
5. Wait for the container to build (first time only — subsequent opens are fast)

Alternatively, use the Command Palette:
- Press `Ctrl+Shift+P`
- Type `Dev Containers: Reopen in Container`
- Press Enter

### 4. Start the app

Once inside the container, open a terminal (`Ctrl+`` `) and run:

```bash
npm start
```

This starts both servers:
- **Frontend (Vite)**: http://localhost:5173
- **Backend (Express API)**: http://localhost:8000

Open http://localhost:5173 in your browser to see the dashboard.

## Running Without Dev Containers

If you prefer to use Docker Compose directly without VS Code Dev Containers:

```bash
# Build and start
docker compose up --build

# Or run in background
docker compose up --build -d

# Stop
docker compose down
```

The app will be available at the same URLs (localhost:5173 and localhost:8000).

## Running Without Docker (Local Node.js)

If you prefer to run directly on your machine:

1. Install Node.js 20+ from https://nodejs.org/
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```

## GitHub Copilot Setup

GitHub Copilot requires a license (individual or enterprise).

### If your org provides Copilot:
1. Install the **GitHub Copilot** extension in VS Code
2. Sign in with your GitHub enterprise account (SSO)
3. Copilot activates automatically — you'll see suggestions as you type

### If you need a license:
- Ask your GitHub org admin to enable Copilot for your seat
- Or sign up individually at https://github.com/features/copilot

## OpenAI Codex CLI (Optional)

OpenAI Codex is a separate CLI tool for AI-assisted coding:

```bash
npm install -g @openai/codex
```

Requires an OpenAI API key — set it as:

```bash
export OPENAI_API_KEY=your_key_here
```

## Troubleshooting

### "Reopen in Container" popup doesn't appear
- Make sure the **Dev Containers** extension is installed
- Use `Ctrl+Shift+P` > `Dev Containers: Reopen in Container` manually

### Container build fails
- Ensure Docker Desktop is running
- Try `docker compose build --no-cache` to rebuild from scratch

### Ports already in use
- Stop any local Node.js processes using ports 5173 or 8000
- Or change the ports in `docker-compose.yml`

### Permission errors on Windows
- Ensure Docker Desktop has access to the drive where the project lives
- Go to Docker Desktop > Settings > Resources > File Sharing

### Git authentication inside container
- The Dev Container inherits your host machine's Git credentials
- If using SSH keys, they are forwarded automatically by VS Code
