"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Board } from "@/components/game/Board";
import { TurnBanner } from "@/components/game/TurnBanner";
import { Button, Badge } from "@/components/ui";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Wifi, WifiOff, Loader2, Eye, RotateCcw, Trophy, Sparkles } from "lucide-react";
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
  const [opponentLeft, setOpponentLeft] = useState(false);

  const handleMove = useCallback(
    (move: Move) => {
      if (!socketRef.current || !gameState || gameState.status !== "playing" || isSpectator) return;
      if (gameState.currentPlayer !== playerNumber) return;
      socketRef.current.emit("move:make", { roomCode, move });
    },
    [gameState, playerNumber, roomCode, isSpectator]
  );



  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket", "polling"], timeout: 5000 });

    s.on("connect", () => {
      setConnectionStatus("connected");
      if (isSpectator) {
        s.emit("room:spectate", { roomCode });
      } else {
        s.emit("room:join", { roomCode, playerName: "Player" });
      }
    });

    s.on("room:joined", ({ room }: { room: { players: PlayerInfo[]; config: { rows: number; cols: number } } }) => {
      if (!isSpectator) {
        setPlayerNumber(room.players.length === 1 ? 1 : 2);
      }
      setPlayerNames(room.players.map((p: PlayerInfo) => p.name));
      while (room.players.length < 2) {
        room.players.push({ id: "", name: "Waiting..." });
      }
      const config = room.config || { rows: 5, cols: 5 };
      setGameState(createInitialState(config));
    });

    s.on("player:joined", ({ player }: { player: { name: string } }) => {
      setPlayerNames((prev) => {
        const next = [...prev];
        if (next.length < 2 || next[1] === "Waiting...") {
          next[1] = player.name || "Player 2";
        }
        return next;
      });
    });

    s.on("move:made", ({ move, playerNumber }: { move: Move; playerNumber: 1 | 2 }) => {
      setGameState((prev) => {
        if (!prev || prev.status !== "playing") return prev;
        return applyMove(prev, move, playerNumber);
      });
    });

    s.on("opponent:disconnected", () => {
      setOpponentLeft(true);
    });

    s.on("player:left", () => {
      setOpponentLeft(true);
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

  const showResult = gameState?.status === "finished";
  const resultWinner = gameState?.winner ?? null;
  const p1Score = gameState?.scores[0] ?? 0;
  const p2Score = gameState?.scores[1] ?? 0;

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
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" aria-hidden="true" />
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

      {connectionStatus === "disconnected" && !gameState && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <WifiOff className="h-8 w-8 text-muted mx-auto mb-3" aria-hidden="true" />
            <p className="text-muted mb-4">Connection lost</p>
            <Link href="/game/online">
              <Button variant="secondary">Go Back</Button>
            </Link>
          </div>
        </div>
      )}

      {connectionStatus === "connected" && gameState && (
        <>
          <TurnBanner
            currentPlayer={gameState.currentPlayer}
            playerNumber={isSpectator ? null : playerNumber}
            labels={{ 1: playerNames[0] || "Player 1", 2: playerNames[1] || "Player 2" }}
            gameStatus={gameState.status}
            isSpectator={isSpectator}
            className="mb-4"
          />

          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--player1)" }} />
                <span className="text-sm font-medium text-muted">{playerNames[0] || "Player 1"}</span>
              </div>
              <motion.span
                key={`p1-${p1Score}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold font-mono"
              >
                {p1Score}
              </motion.span>
            </div>

            <div className="text-muted text-xs font-mono">vs</div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--player2)" }} />
                <span className="text-sm font-medium text-muted">{playerNames[1] || "Player 2"}</span>
              </div>
              <motion.span
                key={`p2-${p2Score}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold font-mono"
              >
                {p2Score}
              </motion.span>
            </div>
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

          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-3xl p-8 max-w-sm w-full text-center shadow-elevated"
              >
                {resultWinner === null ? (
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted" aria-hidden="true" />
                ) : resultWinner === 0 ? (
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" aria-hidden="true" />
                )}
                <h2 className="text-2xl font-bold mb-1">
                  {resultWinner === 0
                    ? "Draw!"
                    : resultWinner === null
                    ? "Game Over"
                    : `${playerNames[resultWinner - 1]} Wins!`}
                </h2>
                <p className="text-muted text-sm mb-6">
                  {p1Score} - {p2Score} &middot; {gameState.moveCount} moves
                </p>
                <Link href="/game/online">
                  <Button variant="gradient" size="lg" className="w-full">
                    <RotateCcw className="h-4 w-4" />
                    New Game
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {opponentLeft && !showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-3xl p-8 max-w-sm w-full text-center shadow-elevated"
              >
                <WifiOff className="h-12 w-12 mx-auto mb-4 text-muted" aria-hidden="true" />
                <h2 className="text-2xl font-bold mb-1">Opponent Left</h2>
                <p className="text-muted text-sm mb-6">Your opponent has disconnected</p>
                <Link href="/game/online">
                  <Button variant="gradient" size="lg" className="w-full">
                    Back to Lobby
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </main>
  );
}

export default function OnlineRoomPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
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
      <Icon className={`h-3 w-3 mr-1 ${status === "connecting" ? "animate-spin" : ""}`} aria-hidden="true" />
      {label}
    </Badge>
  );
}


