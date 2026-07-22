<div align="center">

# 🎮 Dots & Boxes

**A modern, full-stack take on the classic pencil-and-paper game.**

Built with **Next.js 16 / React 19** on the front end and a **Node.js + Socket.IO** real-time server on the back end.
Play locally against a friend, challenge an AI across five difficulty levels, or battle players online in a live multiplayer room.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.9.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![CI](https://img.shields.io/github/actions/workflow/status/Manthan-13521/Dots_and_Boxes/ci.yml?branch=main&label=CI&logo=githubactions&logoColor=white)](https://github.com/Manthan-13521/Dots_and_Boxes/actions)
[![License](https://img.shields.io/badge/license-unspecified-lightgrey)](#-license)

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Scripts](#-available-scripts) •
[Deployment](#-deployment) •
[Contributing](#-contributing)

</div>

<br>

## ✨ Features

| | |
|---|---|
| 🧑‍🤝‍🧑 **Local Multiplayer** | Two players share one device |
| 🤖 **vs AI** | Minimax with alpha-beta pruning in a Web Worker — five difficulty tiers (Easy → Impossible) |
| 🌐 **Online Multiplayer** | Create or join a room with a 6-character code and play in real time over Socket.IO |
| 👀 **Spectator Mode** | Watch a live match unfold in an existing room |
| 🎯 **Practice / Solo Mode** | Play alone to learn the rules |
| 📐 **Configurable Board Size** | Anywhere from 2×2 up to 15×15 |
| 🔁 **Replays** | Games are saved locally (up to 20) and can be exported/imported as JSON |
| 🏆 **Achievements** | Track milestones like fastest win, perfect game, and win streaks |
| 🎨 **Customizable Experience** | Light/dark theme, color-blind mode, sound effects, background music, animation toggles |
| 🔌 **Reconnection Handling** | Drop your connection mid-game and rejoin the same session within a 60-second grace period |
| 🛡️ **Server-Side Safeguards** | Per-IP rate limiting on room creation/joins and per-socket move rate limiting |

<br>

## 🛠️ Tech Stack

<table>
<tr><td valign="top" width="33%">

### 🖥️ Client
`/client`

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Radix UI primitives
- Framer Motion
- Zustand
- Socket.IO client
- Vitest + Testing Library

</td><td valign="top" width="33%">

### 🗄️ Server
`/server`

- Node.js + TypeScript
- Express
- Socket.IO
- Authoritative, server-verified game state

</td><td valign="top" width="33%">

### ⚙️ Tooling
`/`

- npm workspaces monorepo
- ESLint + strict TypeScript
- GitHub Actions CI
- Vercel (client) + Railway (server)

</td></tr>
</table>

<br>

## 📁 Project Structure

```
Dots_and_Boxes/
├── client/                    # Next.js front end
│   ├── src/
│   │   ├── app/                # App Router pages (home, game, achievements, profile, settings)
│   │   ├── components/         # UI, game, and shared components
│   │   ├── lib/
│   │   │   ├── ai/               # Minimax AI worker + bridge
│   │   │   ├── game/             # Core game engine, types, rules
│   │   │   ├── hooks/            # React hooks (socket, game state, etc.)
│   │   │   └── sound/            # Audio handling
│   │   ├── providers/          # Theme provider
│   │   ├── stores/              # Zustand stores (game, replay, UI)
│   │   └── __tests__/          # Vitest unit tests
│   └── vercel.json
├── server/                    # Socket.IO real-time server
│   ├── src/index.ts             # Room, connection, and game-state logic
│   └── railway.json
├── .github/workflows/ci.yml    # CI pipeline
├── .env.example
├── vercel.json                  # Root Vercel config (points to client)
└── package.json                  # Workspace root
```

<br>

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20.9.0`
- npm

### Installation

```bash
git clone https://github.com/Manthan-13521/Dots_and_Boxes.git
cd Dots_and_Boxes
npm install
```

> Installs dependencies for both workspaces (`client` and `server`).

### Environment Variables

```bash
cp .env.example .env
```

| Variable | Location | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SOCKET_URL` | client (build time) | `http://localhost:3001` | URL of the Socket.IO server |
| `PORT` | server | `3001` | Port the server listens on |
| `CLIENT_URL` | server | `http://localhost:3000` | Allowed CORS origin for the client |
| `RECONNECT_TIMEOUT_MS` | server | `60000` | Grace period before a disconnected player is removed from a room |

### Run in Development

```bash
npm run dev
```

Or run each side individually:

```bash
npm run dev:client   # Next.js dev server  → http://localhost:3000
npm run dev:server   # Socket.IO server    → http://localhost:3001
```

<br>

## 📜 Available Scripts

Run from the repository root:

| Script | Description |
|---|---|
| `npm run dev` | Start client and server concurrently |
| `npm run build:all` | Build both client and server |
| `npm run build:client` | Build the Next.js client |
| `npm run build:server` | Compile the server TypeScript |
| `npm run lint` | Lint the client |
| `npm run type-check` | Type-check the client |
| `npm run test` | Run client unit tests (Vitest) |
| `npm run clean` | Remove build artifacts and `node_modules` |

<br>

## 🧪 Testing

Unit tests cover the core game engine and AI logic:

```bash
npm run test                    # run once
npm run test:watch -w client    # watch mode
```

<br>

## ☁️ Deployment

| | |
|---|---|
| **Client** | Configured for [Vercel](https://vercel.com) via the root `vercel.json` (`rootDirectory: client`) and `client/vercel.json` |
| **Server** | Configured for [Railway](https://railway.app) via `server/railway.json` (builds with Nixpacks, runs `node dist/index.js`) |

> Set `NEXT_PUBLIC_SOCKET_URL` on the client deployment to point at your deployed server, and `CLIENT_URL` on the server deployment to point back at your deployed client.

### Continuous Integration

Every push and pull request to `main` runs via [GitHub Actions](.github/workflows/ci.yml):

- **Client job:** install → lint → type-check → test → build
- **Server job:** install → type-check → build

<br>

## 🎲 Game Modes

| Mode | Description |
|---|---|
| 🧑‍🤝‍🧑 Local Multiplayer | Two players alternate turns on one device |
| 🤖 vs AI | Play against a minimax-driven AI (Easy, Medium, Hard, Expert, Impossible) |
| 🌐 Online | Create a room and share the 6-character code, or join an existing one |
| 🎯 Practice | Play solo to learn the mechanics |
| 👀 Spectate | Join an existing online room as a read-only observer |

<br>

## 🤝 Contributing

Issues and pull requests are welcome! Before opening a PR, please make sure the following all pass:

```bash
npm run lint
npm run type-check
npm run test
```

<br>

## 📄 License

No license has been specified for this project yet. Consider adding a `LICENSE` file (e.g. MIT) if you intend for others to use or contribute to this code.

<br>

<div align="center">

Made with 🖤 by [Manthan-13521](https://github.com/Manthan-13521)

</div>
