import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const MAX_ROOMS = 1000;
const MAX_SPECTATORS_PER_ROOM = 50;
const RATE_LIMIT_WINDOW = 1000;
const MAX_MOVES_PER_WINDOW = 10;

const RECONNECT_TIMEOUT_MS = process.env.RECONNECT_TIMEOUT_MS ? parseInt(process.env.RECONNECT_TIMEOUT_MS) : 60000;

interface PlayerInfo {
  id: string;
  sessionId: string;
  name: string;
  connected: boolean;
  disconnectTimeout?: NodeJS.Timeout;
}

interface GameState {
  config: { rows: number; cols: number };
  horizontalEdges: boolean[][];
  verticalEdges: boolean[][];
  boxes: number[][];
  currentPlayer: 1 | 2;
  scores: [number, number];
  status: "waiting" | "playing" | "finished";
  winner: 1 | 2 | 0 | null;
  lastMove: { move: { type: "H" | "V"; row: number; col: number }; player: 1 | 2; completedBoxes: [number, number][] } | null;
  moveCount: number;
  version: number;
}

interface RoomState {
  code: string;
  players: PlayerInfo[];
  spectators: string[];
  config: { rows: number; cols: number };
  gameState?: GameState;
  moveCounts: Map<string, { count: number; windowStart: number }>;
}

const rooms = new Map<string, RoomState>();

const ipLimits = new Map<string, { joins: number; creates: number; windowStart: number }>();
const IP_LIMIT_WINDOW = 60000;

function checkIpLimit(ip: string, type: 'join' | 'create'): boolean {
  const now = Date.now();
  let entry = ipLimits.get(ip);
  if (!entry || now - entry.windowStart > IP_LIMIT_WINDOW) {
    entry = { joins: 0, creates: 0, windowStart: now };
    ipLimits.set(ip, entry);
  }
  if (type === 'join') {
    entry.joins++;
    return entry.joins > 20;
  } else {
    entry.creates++;
    return entry.creates > 5;
  }
}

function createInitialGameState(config: { rows: number; cols: number }): GameState {
  const { rows, cols } = config;
  return {
    config,
    horizontalEdges: Array.from({ length: rows + 1 }, () => Array(cols).fill(false)),
    verticalEdges: Array.from({ length: rows }, () => Array(cols + 1).fill(false)),
    boxes: Array.from({ length: rows }, () => Array(cols).fill(0)),
    currentPlayer: 1,
    scores: [0, 0],
    status: "playing",
    winner: null,
    lastMove: null,
    moveCount: 0,
    version: 1,
  };
}

function isMoveValid(move: unknown, config: { rows: number; cols: number }): boolean {
  if (!move || typeof move !== "object") return false;
  const m = move as { type?: unknown; row?: unknown; col?: unknown };
  if (m.type !== "H" && m.type !== "V") return false;
  if (typeof m.row !== "number" || typeof m.col !== "number") return false;
  if (!Number.isInteger(m.row) || !Number.isInteger(m.col)) return false;
  if (m.row < 0 || m.col < 0) return false;
  if (m.type === "H" && m.row > config.rows) return false;
  if (m.type === "H" && m.col >= config.cols) return false;
  if (m.type === "V" && m.row >= config.rows) return false;
  if (m.type === "V" && m.col > config.cols) return false;
  return true;
}

function getSurroundingBoxes(state: GameState, move: { type: "H" | "V"; row: number; col: number }): [number, number][] {
  const boxes: [number, number][] = [];
  const { rows, cols } = state.config;

  if (move.type === "H") {
    if (move.row > 0) boxes.push([move.row - 1, move.col]);
    if (move.row < rows) boxes.push([move.row, move.col]);
  } else {
    if (move.col > 0) boxes.push([move.row, move.col - 1]);
    if (move.col < cols) boxes.push([move.row, move.col]);
  }
  return boxes;
}

function isBoxComplete(state: GameState, row: number, col: number): boolean {
  const { rows, cols } = state.config;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
  return (
    state.horizontalEdges[row][col] &&
    state.horizontalEdges[row + 1][col] &&
    state.verticalEdges[row][col] &&
    state.verticalEdges[row][col + 1]
  );
}

function applyMoveToGameState(state: GameState, move: { type: "H" | "V"; row: number; col: number }, player: 1 | 2): { newState: GameState; completedBoxes: [number, number][]; success: boolean } {
  if (state.status !== "playing") return { newState: state, completedBoxes: [], success: false };
  if (player !== state.currentPlayer) return { newState: state, completedBoxes: [], success: false };

  if (move.type === "H") {
    if (state.horizontalEdges[move.row][move.col]) return { newState: state, completedBoxes: [], success: false };
  } else {
    if (state.verticalEdges[move.row][move.col]) return { newState: state, completedBoxes: [], success: false };
  }

  const newState: GameState = {
    ...state,
    horizontalEdges: state.horizontalEdges.map((row) => [...row]),
    verticalEdges: state.verticalEdges.map((row) => [...row]),
    boxes: state.boxes.map((row) => [...row]),
    scores: [...state.scores] as [number, number],
    lastMove: null,
    version: state.version + 1,
  };

  if (move.type === "H") {
    newState.horizontalEdges[move.row][move.col] = true;
  } else {
    newState.verticalEdges[move.row][move.col] = true;
  }

  const surroundingBoxes = getSurroundingBoxes(newState, move);
  const completedBoxes: [number, number][] = [];

  for (const [br, bc] of surroundingBoxes) {
    if (isBoxComplete(newState, br, bc) && newState.boxes[br][bc] === 0) {
      newState.boxes[br][bc] = player;
      newState.scores[player - 1]++;
      completedBoxes.push([br, bc]);
    }
  }

  newState.lastMove = { move, player, completedBoxes };
  newState.moveCount = state.moveCount + 1;

  if (completedBoxes.length === 0) {
    newState.currentPlayer = player === 1 ? 2 : 1;
  }

  const totalBoxes = newState.config.rows * newState.config.cols;
  const claimedBoxes = newState.scores[0] + newState.scores[1];

  if (claimedBoxes >= totalBoxes) {
    newState.status = "finished";
    if (newState.scores[0] > newState.scores[1]) {
      newState.winner = 1;
    } else if (newState.scores[1] > newState.scores[0]) {
      newState.winner = 2;
    } else {
      newState.winner = 0;
    }
  }

  return { newState, completedBoxes, success: true };
}

function isRateLimited(socketId: string, room: RoomState): boolean {
  const now = Date.now();
  let entry = room.moveCounts.get(socketId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    entry = { count: 0, windowStart: now };
    room.moveCounts.set(socketId, entry);
  }
  entry.count++;
  return entry.count > MAX_MOVES_PER_WINDOW;
}

function cleanupEmptyRooms(): void {
  for (const [code, room] of rooms) {
    if (room.players.length === 0 && room.spectators.length === 0) {
      rooms.delete(code);
    }
  }
}

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), rooms: rooms.size });
});
app.get("/rooms", (_req, res) => {
  res.json({ rooms: getPublicRooms() });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
  pingInterval: 5000,
  pingTimeout: 10000,
});

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

function getPublicRooms() {
  return Array.from(rooms.values()).map((r) => ({
    code: r.code,
    playerCount: r.players.length,
    spectatorCount: r.spectators.length,
    config: r.config,
  }));
}


io.on("connection", (socket) => {
  console.log(`[DEBUG] Socket Connected: ${socket.id}`);
  const ip = socket.handshake.address;
  socket.on("room:create", ({ config }) => {
    if (checkIpLimit(ip, 'create')) {
      socket.emit("error", { message: "Rate limit exceeded for room creation.", code: "RATE_LIMITED" });
      return;
    }
    if (rooms.size >= MAX_ROOMS) {
      socket.emit("error", { message: "Server is full. Try again later.", code: "SERVER_FULL" });
      return;
    }
    const rows = Math.min(Math.max(config?.rows ?? 5, 2), 15);
    const cols = Math.min(Math.max(config?.cols ?? 5, 2), 15);
    const code = generateRoomCode();
    const room: RoomState = {
      code,
      players: [],
      spectators: [],
      config: { rows, cols },
      moveCounts: new Map(),
    };
    rooms.set(code, room);
    socket.emit("room:created", { roomCode: code });
    io.emit("rooms:updated", getPublicRooms());
  });

  socket.on("room:join", ({ roomCode, playerName, sessionId }) => {
    if (typeof roomCode !== "string" || !/^[A-Z0-9]{6}$/.test(roomCode)) {
      socket.emit("error", { message: "Invalid room code", code: "INVALID_CODE" });
      return;
    }
    if (checkIpLimit(ip, 'join')) {
      socket.emit("error", { message: "Rate limit exceeded.", code: "RATE_LIMITED" });
      return;
    }
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit("error", { message: "Room not found", code: "ROOM_NOT_FOUND" });
      return;
    }
    
    let player = sessionId ? room.players.find(p => p.sessionId === sessionId) : undefined;
    
    if (player) {
      player.id = socket.id;
      player.connected = true;
      if (player.disconnectTimeout) {
        clearTimeout(player.disconnectTimeout);
        player.disconnectTimeout = undefined;
      }
      socket.join(roomCode);
      console.log(`[DEBUG] Socket ${socket.id} reconnected as ${player.name} (Session: ${sessionId})`);
    } else {
      if (room.players.length >= 2) {
        socket.emit("error", { message: "Room is full", code: "ROOM_FULL" });
        return;
      }
      const defaultName = room.players.length === 0 ? "Player 1" : "Player 2";
      const name = typeof playerName === "string" && playerName.length > 0
        ? playerName.slice(0, 20)
        : defaultName;
      // Trust client sessionId or generate one if missing (fallback)
      const newSessionId = sessionId || uuidv4();
      player = { id: socket.id, sessionId: newSessionId, name, connected: true };
      room.players.push(player);
      socket.join(roomCode);
      console.log(`[DEBUG] Socket ${socket.id} joined room ${roomCode} as ${name} (Player ${room.players.length})`);
    }
    
    // Ensure authoritative initial state is given
    if (!room.gameState) {
      room.gameState = createInitialGameState(room.config);
    }
    
    socket.emit("room:joined", { 
      roomCode, 
      room: { players: room.players.map(p => ({ id: p.id, name: p.name, connected: p.connected })), config: room.config }, 
      sessionId: player.sessionId,
      playerNumber: room.players.indexOf(player) + 1
    });
    
    socket.emit("game:update", { gameState: room.gameState });
    
    if (room.players.length === 2) {
      socket.to(roomCode).emit("player:joined", { player });
    }
    io.emit("rooms:updated", getPublicRooms());
  });

  socket.on("room:spectate", ({ roomCode }) => {
    if (typeof roomCode !== "string") {
      socket.emit("error", { message: "Invalid room code", code: "INVALID_CODE" });
      return;
    }
    if (checkIpLimit(ip, 'join')) {
      socket.emit("error", { message: "Rate limit exceeded.", code: "RATE_LIMITED" });
      return;
    }
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit("error", { message: "Room not found", code: "ROOM_NOT_FOUND" });
      return;
    }
    if (room.spectators.length >= MAX_SPECTATORS_PER_ROOM) {
      socket.emit("error", { message: "Spectator limit reached", code: "SPECTATOR_LIMIT" });
      return;
    }
    if (!room.spectators.includes(socket.id)) {
      room.spectators.push(socket.id);
    }
    socket.join(roomCode);
    console.log(`[DEBUG] Socket ${socket.id} joined room ${roomCode} as spectator`);
    socket.emit("room:joined", { roomCode, room: { players: room.players.map(p => ({ id: p.id, name: p.name, connected: p.connected })), config: room.config }, spectator: true });
    if (room.gameState) {
      socket.emit("game:update", { gameState: room.gameState });
    }
  });

  socket.on("rooms:list", () => {
    socket.emit("rooms:list", getPublicRooms());
  });

  socket.on("move:make", ({ roomCode, move }) => {
    if (typeof roomCode !== "string") return;
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const playerIndex = room.players.indexOf(player);
    if (playerIndex === -1) return;
    const playerNumber = (playerIndex + 1) as 1 | 2;

    if (isRateLimited(socket.id, room)) {
      socket.emit("error", { message: "Rate limited", code: "RATE_LIMITED" });
      return;
    }

    console.log(`[DEBUG] Move Received from Socket ${socket.id} (Player ${playerNumber}) in room ${roomCode}:`, move);

    if (!isMoveValid(move, room.config)) {
      console.log(`[DEBUG] Move Rejected: Invalid coordinates from Socket ${socket.id}`);
      socket.emit("error", { message: "Invalid move", code: "INVALID_MOVE" });
      return;
    }

    if (!room.gameState) {
      room.gameState = createInitialGameState(room.config);
    }

    const { newState, success } = applyMoveToGameState(room.gameState, move as any, playerNumber);
    if (!success) {
      console.log(`[DEBUG] Move Rejected: Invalid state condition (wrong turn or occupied) from Socket ${socket.id}`);
      socket.emit("error", { message: "Move rejected by server rules", code: "MOVE_REJECTED" });
      return;
    }

    room.gameState = newState;
    io.to(roomCode).emit("game:update", { gameState: room.gameState, timestamp: Date.now() });
  });

  socket.on("disconnect", () => {
    for (const [code, room] of rooms) {
      const playerIdx = room.players.findIndex((p) => p.id === socket.id);
      if (playerIdx !== -1) {
        const p = room.players[playerIdx];
        p.connected = false;
        socket.to(code).emit("opponent:disconnected");
        
        p.disconnectTimeout = setTimeout(() => {
            const currentIdx = room.players.findIndex(pl => pl.sessionId === p.sessionId);
            if (currentIdx !== -1 && !room.players[currentIdx].connected) {
                const removedName = room.players[currentIdx].name;
                room.players.splice(currentIdx, 1);
                io.to(code).emit("player:left", { playerId: socket.id, playerName: removedName });
                if (room.players.length === 0) {
                    rooms.delete(code);
                }
                io.emit("rooms:updated", getPublicRooms());
            }
        }, RECONNECT_TIMEOUT_MS);
        
        io.emit("rooms:updated", getPublicRooms());
        break;
      }
      const specIdx = room.spectators.indexOf(socket.id);
      if (specIdx !== -1) {
        room.spectators.splice(specIdx, 1);
        break;
      }
    }
  });
});

setInterval(cleanupEmptyRooms, 60000);

const server = httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  io.close();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 5000);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
