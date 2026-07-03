"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Board } from "@/components/game/Board";
import { Button, Badge } from "@/components/ui";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Wifi, WifiOff, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import type { Move, GameState } from "@/lib/game/types";
import { createInitialState, applyMove } from "@/lib/game/engine";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface PlayerInfo {
  id: string;
  name: string;
}

function OnlineRoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = params.id as string;
  const isSpectator = searchParams.get("spectate") === "1";
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>(["Waiting...", "Waiting..."]);

  const handleMove = useCallback(
    (move: Move) => {
      if (!socketRef.current || !gameState || gameState.status !== "playing" || isSpectator) return;
      if (gameState.currentPlayer !== playerNumber) return;
      socketRef.current.emit("move:make", { roomCode, move });
    },
    [gameState, playerNumber, roomCode, isSpectator]
  );

  useEffect(() => {
    const s = io(SOCKET_URL, { timeout: 5000 });

    s.on("connect", () => {
      setConnectionStatus("connected");
      if (isSpectator) {
        s.emit("room:spectate", { roomCode });
      } else {
        s.emit("room:join", { roomCode, playerName: "Player" });
      }
    });

    s.on("room:joined", ({ room }: { room: { players: PlayerInfo[]; config: { rows: number; cols: number }; spectator?: boolean } }) => {
      if (!isSpectator) {
        setPlayerNumber(room.players.length === 1 ? 1 : 2);
      }
      setPlayerNames(room.players.map((p: PlayerInfo) => p.name));
      const config = room.config || { rows: 5, cols: 5 };
      setGameState(createInitialState(config));
    });

    s.on("player:joined", ({ player }: { player: { name: string } }) => {
      setPlayerNames((prev) => {
        const next = [...prev];
        if (!next[1] || next[1] === "Waiting...") {
          next[1] = player.name || "Player 2";
        }
        return next;
      });
    });

    s.on("player:left", () => {
      setConnectionStatus("disconnected");
    });

    s.on("move:made", ({ move }) => {
      setGameState((prev) => {
        if (!prev || prev.status !== "playing") return prev;
        return applyMove(prev, move, prev.currentPlayer);
      });
    });

    s.on("connect_error", () => {
      setConnectionStatus("error");
    });

    s.on("error", () => {
      setConnectionStatus("error");
    });

    s.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socketRef.current = s;

    return () => {
      s.disconnect();
    };
  }, [roomCode, isSpectator]);

  return (
    <main className="min-h-dvh flex flex-col p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href={isSpectator ? "/game/spectate" : "/game/online"}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {isSpectator && (
            <Badge variant="warning" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Spectating
            </Badge>
          )}
          <ConnectionBadge status={connectionStatus} />
          <Badge variant="info" size="sm">
            <span className="font-mono tracking-widest">{roomCode}</span>
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigator.clipboard.writeText(roomCode)}
            aria-label="Copy room code"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {connectionStatus === "connecting" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted">{isSpectator ? "Connecting to spectator mode..." : "Connecting to room..."}</p>
          </div>
        </div>
      )}

      {connectionStatus === "error" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error mb-2">Failed to connect</p>
            <Link href={isSpectator ? "/game/spectate" : "/game/online"}>
              <Button variant="secondary">Go Back</Button>
            </Link>
          </div>
        </div>
      )}

      {connectionStatus === "connected" && gameState && (
        <>
          <div className="flex items-center justify-center gap-8 mb-6">
            <PlayerScoreDisplay
              name={playerNames[0]}
              score={gameState.scores[0]}
              isActive={gameState.currentPlayer === 1}
              color="var(--player1)"
            />
            <span className="text-muted text-sm font-mono">vs</span>
            <PlayerScoreDisplay
              name={playerNames[1]}
              score={gameState.scores[1]}
              isActive={gameState.currentPlayer === 2}
              color="var(--player2)"
            />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <Board
              state={gameState}
              onMove={handleMove}
              currentPlayer={gameState.currentPlayer}
              disabled={gameState.status !== "playing" || isSpectator || gameState.currentPlayer !== playerNumber}
              className="max-w-[500px] w-full"
            />
          </div>
        </>
      )}

      {connectionStatus === "disconnected" && !gameState && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <WifiOff className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-muted mb-4">Connection lost</p>
            <Link href="/game/online">
              <Button variant="secondary">Go Back</Button>
            </Link>
          </div>
        </div>
      )}

      {connectionStatus === "disconnected" && !gameState && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <WifiOff className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-muted mb-4">Connection lost</p>
            <Link href="/game/online">
              <Button variant="secondary">Go Back</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function OnlineRoomPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    }>
      <OnlineRoomContent />
    </Suspense>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const configs = {
    connecting: { icon: Loader2, label: "Connecting...", variant: "warning" as const },
    connected: { icon: Wifi, label: "Connected", variant: "success" as const },
    disconnected: { icon: WifiOff, label: "Disconnected", variant: "error" as const },
    error: { icon: WifiOff, label: "Error", variant: "error" as const },
  };
  const { icon: Icon, label, variant } = configs[status];
  return (
    <Badge variant={variant} size="sm">
      <Icon className={`h-3 w-3 mr-1 ${status === "connecting" ? "animate-spin" : ""}`} />
      {label}
    </Badge>
  );
}

function PlayerScoreDisplay({
  name,
  score,
  isActive,
  color,
}: {
  name: string;
  score: number;
  isActive: boolean;
  color: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 transition-opacity ${isActive ? "opacity-100" : "opacity-40"}`}>
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-medium">{name}</span>
      <motion.span key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-2xl font-bold font-mono">
        {score}
      </motion.span>
    </div>
  );
}
