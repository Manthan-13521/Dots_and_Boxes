Dots & Boxes
A modern, full-stack take on the classic pencil-and-paper game — built with Next.js 16 / React 19 on the front end and a Node.js + Socket.IO real-time server on the back end. Play locally against a friend, challenge an AI with five difficulty levels, or battle players online in a live multiplayer room.
Features
Local Multiplayer — two players share one device
vs AI — minimax with alpha-beta pruning running in a Web Worker, with five difficulty tiers (Easy → Impossible)
Online Multiplayer — create or join a room with a 6-character code and play in real time over Socket.IO
Spectator Mode — watch a live match unfold in an existing room
Practice / Solo Mode — play alone to learn the rules
Configurable Board Size — anywhere from 2×2 up to 15×15
Replays — games are saved locally (up to 20) and can be exported/imported as JSON
Achievements — track milestones like fastest win, perfect game, and win streaks
Customizable Experience — light/dark theme, color-blind mode, sound effects, background music, and animation toggles
Reconnection Handling — drop your connection mid-game and rejoin the same session within a 60-second grace period
Server-Side Safeguards — per-IP rate limiting on room creation/joins and per-socket move rate limiting
Tech Stack
Client (/client)
Next.js 16 (App Router) + React 19 + TypeScript
Tailwind CSS 4 for styling
Radix UI primitives (dialog, select, slider, switch, toast, tooltip)
Framer Motion for animation
Zustand for state management
Socket.IO client for real-time communication
Vitest + Testing Library for unit tests
Server (/server)
Node.js + TypeScript
Express
Socket.IO for the real-time game protocol
Authoritative game-state validation (all moves are re-verified server-side)
Tooling
npm workspaces monorepo (client, server)
ESLint, TypeScript strict mode
GitHub Actions CI (lint, type-check, test, build)
Deployment: Vercel (client) + Railway (server)
Project Structure
Dots_and_Boxes/
├── client/                 # Next.js front end
│   ├── src/
│   │   ├── app/             # App Router pages (home, game, achievements, profile, settings)
│   │   ├── components/      # UI, game, and shared components
│   │   ├── lib/
│   │   │   ├── ai/          # Minimax AI worker + bridge
│   │   │   ├── game/        # Core game engine, types, rules
│   │   │   ├── hooks/        # React hooks (socket, game state, etc.)
│   │   │   └── sound/        # Audio handling
│   │   ├── providers/       # Theme provider
│   │   ├── stores/          # Zustand stores (game, replay, UI)
│   │   └── __tests__/       # Vitest unit tests
│   └── vercel.json
├── server/                 # Socket.IO real-time server
│   ├── src/index.ts         # Room, connection, and game-state logic
│   └── railway.json
├── .github/workflows/ci.yml # CI pipeline
├── .env.example
├── vercel.json               # Root Vercel config (points to client)
└── package.json               # Workspace root
Getting Started
Prerequisites
Node.js >= 20.9.0
npm
Installation
bash
git clone https://github.com/Manthan-13521/Dots_and_Boxes.git
cd Dots_and_Boxes
npm install
This installs dependencies for both workspaces (client and server).
Environment Variables
Copy the example file and adjust as needed:
bash
cp .env.example .env
Variable	Location	Default	Description
NEXT_PUBLIC_SOCKET_URL	client (build time)	http://localhost:3001	URL of the Socket.IO server
PORT	server	3001	Port the server listens on
CLIENT_URL	server	http://localhost:3000	Allowed CORS origin for the client
RECONNECT_TIMEOUT_MS	server	60000	Grace period before a disconnected player is removed from a room
Run in Development
Run both the client and server together from the repo root:
bash
npm run dev
Or run them individually:
bash
npm run dev:client   # Next.js dev server → http://localhost:3000
npm run dev:server   # Socket.IO server → http://localhost:3001
Available Scripts
Run from the repository root:
Script	Description
npm run dev	Start client and server concurrently
npm run build:all	Build both client and server
npm run build:client	Build the Next.js client
npm run build:server	Compile the server TypeScript
npm run lint	Lint the client
npm run type-check	Type-check the client
npm run test	Run client unit tests (Vitest)
npm run clean	Remove build artifacts and node_modules
Testing
Unit tests cover the core game engine and AI logic:
bash
npm run test          # run once
npm run test:watch -w client   # watch mode
Deployment
Client — configured for Vercel via the root vercel.json (rootDirectory: client) and client/vercel.json.
Server — configured for Railway via server/railway.json (builds with Nixpacks, runs node dist/index.js).
Set NEXT_PUBLIC_SOCKET_URL on the client deployment to point at your deployed server, and CLIENT_URL on the server deployment to point back at your deployed client.
Continuous Integration
Every push and pull request to main runs via GitHub Actions (.github/workflows/ci.yml):
Client job: install → lint → type-check → test → build
Server job: install → type-check → build
Game Modes
Mode	Description
Local Multiplayer	Two players alternate turns on one device
vs AI	Play against a minimax-driven AI (Easy, Medium, Hard, Expert, Impossible)
Online	Create a room and share the 6-character code, or join an existing one
Practice	Play solo to learn the mechanics
Spectate	Join an existing online room as a read-only observer
Contributing
Issues and pull requests are welcome. Please make sure npm run lint, npm run type-check, and npm run test all pass before opening a PR.
License
No license has been specified for this project yet. Consider adding a LICENSE file (e.g., MIT) if you intend for others to use or contribute to this code.
