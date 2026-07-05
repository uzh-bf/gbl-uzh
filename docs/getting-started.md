---
type: Getting Started Guide
title: Getting Started (No Coding Experience Needed)
description: How to get the GBL platform running on your own computer and build a learning game together with an AI assistant — without writing code yourself.
tags:
  - onboarding
  - starter
  - devcontainer
  - non-technical
timestamp: "2026-07-05T00:00:00Z"
---

# Getting Started (No Coding Experience Needed)

This guide gets you from nothing to a running learning-game platform on your own computer, with an AI assistant that does the technical work. You describe the game you want; the assistant designs and builds it; you play-test it in your browser and give feedback.

You do not need to know Git, terminals, or programming. Expect the first-time setup to take about half an hour, most of it waiting.

For **Windows 10/11** and **macOS**.

> Already have your own coding agent (Claude Desktop, the Codex app, Claude Code in a terminal) and want it to drive the setup instead of doing it in VS Code yourself? Follow [building-with-an-agent.md](building-with-an-agent.md) — it needs only Docker (no VS Code).

## What you need (three free installs)

1. **Docker Desktop** — runs the platform in an isolated box on your computer. Download from [docker.com](https://www.docker.com/products/docker-desktop/) and install with the default settings.
   - _Windows:_ the installer may prompt for **WSL 2** — accept it (and restart if asked). If Docker complains about WSL 2 later, your AI assistant can walk you through the fix.
2. **Visual Studio Code (VS Code)** — the window you will work in. Download from [code.visualstudio.com](https://code.visualstudio.com/).
3. **The "Dev Containers" extension for VS Code** — lets VS Code work inside the Docker box. In VS Code, click the Extensions icon in the left sidebar (four squares), search for **Dev Containers**, and click **Install** on the one by Microsoft.

You will also want a [Claude](https://claude.ai) account for the built-in AI assistant (Claude Code comes preinstalled). Any other AI coding assistant works too — this repository guides them automatically.

## Get the platform running

1. **Start Docker Desktop** and wait until its whale icon says it is running.
2. In VS Code, press **F1** (or `Ctrl+Shift+P`, on Mac `Cmd+Shift+P`), type **clone repository in container volume**, and choose **Dev Containers: Clone Repository in Container Volume…**
3. Paste this address and press Enter:

   ```
   https://github.com/uzh-bf/gbl-uzh
   ```

4. When VS Code asks **which configuration** to use, pick **GBL Starter — build a game (start here)**.
5. Wait. The first start downloads and prepares everything (typically 5–15 minutes depending on your internet connection — later starts take seconds). You can click "show log" in the corner notification to watch it work; a wall of text is normal.
6. When it finishes, your browser opens the demo game at **http://localhost:3000** (if it doesn't: in VS Code open the **Ports** panel at the bottom, find **Demo Game**, and click the globe icon). The very first page can take up to a minute to appear while the app warms up.

## Log in as the game admin

Open **http://localhost:3000/admin/login** and click the login button. That's it — no password. On your own machine you are automatically the demo administrator `gbl-dev@df.uzh.ch`. (Players join games through special links instead; they never need accounts.)

## Meet your AI assistant

In VS Code, open a terminal via the menu: **Terminal → New Terminal**. Then type:

```
claude
```

and press Enter. The first time, it asks you to sign in with your Claude account — follow the link it shows. After that, just talk to it. Good first messages:

- "Give me a tour: what is this project and what can I build with it?"
- "I want to build a learning game about supply chain management for my course. Help me design it." _(the assistant will interview you about learning goals, player decisions, and rounds before it builds anything)_
- "Show me the demo game as a player would see it, so I understand what's possible."

The assistant knows this platform: the repository contains a wiki ([index](index.md)) and step-by-step skills for designing games, creating a new game app, programming the game logic, and building the screens. It reads those on its own.

## If something breaks

Tell your assistant:

> "Something seems broken — run a health check on my environment and fix what you can."

It will diagnose and repair the setup for you. Only three things it cannot do for you:

- **Start Docker Desktop** — if the whale icon isn't running, nothing works. Start it and try again.
- **Approve Windows/WSL 2 prompts** — click through them, restart if asked.
- **Rebuild the box** — if the assistant asks you to "rebuild the container": press **F1** in VS Code → **Dev Containers: Rebuild Container**.

One more reassurance: everything lives inside Docker on your machine. Deleting the containers and volumes removes it completely — nothing is installed into your system. (Curious what the pieces are? Ask your assistant.)
