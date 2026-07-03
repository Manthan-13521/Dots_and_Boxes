import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const MAX_ROOMS = 1000;
const MAX_SPECTATORS_PER_ROOM = 50;
const RATE_LIMIT_WINDOW = 1000;
const MAX_MOVES_PER_WINDOW = 10;

interface PlayerInfo {
  id: string;
  name: string;
}

interface RoomState {
  code: string;
  players: PlayerInfo[];
  spectators: string[];
  config: { rows: number; cols: number };
  moveCounts: Map<string, { count: number; windowStart: number }>;
}

const rooms = new Map<string, RoomState>();

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
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
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

io.on("connection", (socket) => {
  socket.on("room:create", ({ config }) => {
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

  socket.on("room:join", ({ roomCode, playerName }) => {
    if (typeof roomCode !== "string" || !/^[A-Z0-9]{6}$/.test(roomCode)) {
      socket.emit("error", { message: "Invalid room code", code: "INVALID_CODE" });
      return;
    }
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit("error", { message: "Room not found", code: "ROOM_NOT_FOUND" });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit("error", { message: "Room is full", code: "ROOM_FULL" });
      return;
    }
    const defaultName = room.players.length === 0 ? "Player 1" : "Player 2";
    const name = typeof playerName === "string" && playerName.length > 0
      ? playerName.slice(0, 20)
      : defaultName;
    const player = { id: socket.id, name };
    room.players.push(player);
    socket.join(roomCode);
    socket.emit("room:joined", { roomCode, room: { players: room.players, config: room.config } });
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
    socket.emit("room:joined", { roomCode, room: { players: room.players, config: room.config }, spectator: true });
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

    if (isRateLimited(socket.id, room)) return;
    if (!isMoveValid(move, room.config)) return;

    io.to(roomCode).emit("move:made", { move, playerId: socket.id, playerNumber: playerIndex + 1 });
  });

  socket.on("disconnect", () => {
    for (const [code, room] of rooms) {
      const playerIdx = room.players.findIndex((p) => p.id === socket.id);
      if (playerIdx !== -1) {
        const removedPlayer = room.players[playerIdx];
        room.players.splice(playerIdx, 1);
        socket.to(code).emit("player:left", { playerId: socket.id, playerName: removedPlayer.name });
        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          socket.to(code).emit("opponent:disconnected");
        }
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
