"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { motion } from "framer-motion";
import { Globe, Copy, ArrowLeft, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export default function OnlinePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [createdRoom, setCreatedRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = useCallback(() => {
    setLoading(true);
    setError("");
    const socket = io(SOCKET_URL);
    socket.emit("room:create", { config: { rows: 5, cols: 5 } });
    socket.on("room:created", ({ roomCode: code }) => {
      setCreatedRoom(code);
      setLoading(false);
      socket.disconnect();
    });
    socket.on("error", ({ message }) => {
      setError(message);
      setLoading(false);
      socket.disconnect();
    });
  }, []);

  const handleJoinRoom = useCallback(() => {
    if (!roomCode.trim()) {
      setError("Enter a room code");
      return;
    }
    router.push(`/game/online/${roomCode.trim().toUpperCase()}`);
  }, [roomCode, router]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="flex items-center gap-2">
          <Link href="/game">
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Online Play</h1>
        </div>

        <Card variant="glass" className="space-y-6">
          <div className="text-center">
            <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-1">Create a Room</h2>
            <p className="text-sm text-muted mb-4">Start a new game and share the code</p>
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleCreateRoom}
              loading={loading}
            >
              Create Room
            </Button>
            {createdRoom && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-surface-elevated border border-border"
              >
                <p className="text-sm text-muted mb-2">Share this code with your opponent:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold font-mono tracking-widest">{createdRoom}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(createdRoom)}
                    aria-label="Copy room code"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-4"
                  onClick={() => router.push(`/game/online/${createdRoom}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                  Join Room
                </Button>
              </motion.div>
            )}
          </div>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted">or</span>
          </div>
        </div>

        <Card variant="glass" className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Join a Room</h2>
          <Input
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            maxLength={6}
            error={error}
          />
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleJoinRoom}
          >
            Join Game
          </Button>
        </Card>

        <Link href="/game/spectate">
          <Card variant="glass" interactive className="flex items-center justify-center gap-3 p-4">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-medium">Spectate active games</span>
          </Card>
        </Link>
      </motion.div>
    </main>
  );
}
