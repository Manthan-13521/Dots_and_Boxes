import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.get("/health", (_req, res) => {
  res.json({ status: "ok", rooms: rooms.size });
});
app.get("/rooms", (_req, res) => {
  const publicRooms = Array.from(rooms.values()).map((r) => ({
    code: r.code,
    playerCount: r.players.length,
    spectatorCount: r.spectators.length,
    config: r.config,
  }));
  res.json({ rooms: publicRooms });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
  pingInterval: 5000,
  pingTimeout: 10000,
});

interface PlayerInfo {
  id: string;
  name: string;
}

interface RoomState {
  code: string;
  players: PlayerInfo[];
  spectators: string[];
  config: { rows: number; cols: number };
  gameState: unknown | null;
}

const rooms = new Map<string, RoomState>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("room:create", ({ config }) => {
    const code = generateRoomCode();
    const room: RoomState = {
      code,
      players: [{ id: socket.id, name: "Player 1" }],
      spectators: [],
      config: config || { rows: 5, cols: 5 },
      gameState: null,
    };
    rooms.set(code, room);
    socket.join(code);
    socket.emit("room:created", { roomCode: code, room });
    io.emit("rooms:updated", getPublicRooms());
    console.log(`Room created: ${code}`);
  });

  socket.on("room:join", ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit("error", { message: "Room not found", code: "ROOM_NOT_FOUND" });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit("error", { message: "Room is full", code: "ROOM_FULL" });
      return;
    }
    room.players.push({ id: socket.id, name: playerName || "Player 2" });
    socket.join(roomCode);
    socket.emit("room:joined", { roomCode, room });
    socket.to(roomCode).emit("player:joined", { player: room.players[1] });
    io.emit("rooms:updated", getPublicRooms());
    console.log(`${playerName} joined room ${roomCode}`);
  });

  socket.on("room:spectate", ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit("error", { message: "Room not found", code: "ROOM_NOT_FOUND" });
      return;
    }
    if (!room.spectators.includes(socket.id)) {
      room.spectators.push(socket.id);
    }
    socket.join(roomCode);
    socket.emit("room:joined", { roomCode, room, spectator: true });
  });

  socket.on("rooms:list", () => {
    socket.emit("rooms:list", getPublicRooms());
  });

  socket.on("move:make", ({ roomCode, move }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    socket.to(roomCode).emit("move:made", { move, playerId: socket.id });
  });

  socket.on("game:state", ({ roomCode, state }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.gameState = state;
    socket.to(roomCode).emit("game:state", state);
  });

  socket.on("disconnect", () => {
    for (const [code, room] of rooms) {
      const playerIdx = room.players.findIndex((p) => p.id === socket.id);
      if (playerIdx !== -1) {
        room.players.splice(playerIdx, 1);
        socket.to(code).emit("player:left", { playerId: socket.id });
        if (room.players.length === 0) {
          rooms.delete(code);
          console.log(`Room ${code} deleted (empty)`);
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
    console.log(`Client disconnected: ${socket.id}`);
  });
});

function getPublicRooms() {
  return Array.from(rooms.values()).map((r) => ({
    code: r.code,
    playerCount: r.players.length,
    spectatorCount: r.spectators.length,
    config: r.config,
  }));
}

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
