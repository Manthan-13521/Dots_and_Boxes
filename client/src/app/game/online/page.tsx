"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Copy, ArrowLeft, ArrowRight, Eye, Users, Sparkles } from "lucide-react";
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
    const socket = io(SOCKET_URL, { timeout: 5000 });
    socket.on("connect_error", () => {
      setError("Failed to connect to game server");
      setLoading(false);
      socket.disconnect();
    });
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
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Link href="/game">
              <Button variant="ghost" size="icon" aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-neon bg-clip-text text-transparent">
                Online Play
              </h1>
              <p className="text-sm text-muted">Battle players from around the world</p>
            </div>
          </div>

          <Card variant="glass" className="space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="text-center pt-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <Globe className="h-12 w-12 text-primary mx-auto mb-3" />
              </motion.div>
              <h2 className="text-xl font-bold mb-1">Create a Room</h2>
              <p className="text-sm text-muted mb-5">Start a new game and invite a friend</p>
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handleCreateRoom}
                loading={loading}
              >
                <Sparkles className="h-4 w-4" />
                Create Room
              </Button>

              <AnimatePresence>
                {createdRoom && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 pt-5 border-t border-glass-border">
                      <p className="text-sm text-muted mb-3">Share this code with your opponent:</p>
                      <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-lg" />
                          <span className="relative text-3xl font-extrabold font-mono tracking-[0.3em] text-primary">
                            {createdRoom}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => navigator.clipboard.writeText(createdRoom)}
                          aria-label="Copy room code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                        <Users className="h-3 w-3" />
                        <span>Waiting for opponent to join...</span>
                      </div>

                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full mt-4"
                        onClick={() => router.push(`/game/online/${createdRoom}`)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Join Room
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted font-semibold tracking-wider">or</span>
            </div>
          </div>

          <Card variant="glass" className="space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <h2 className="text-lg font-bold text-center pt-1">Join a Room</h2>
            <Input
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              maxLength={6}
              error={error}
            />
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleJoinRoom}
            >
              <ArrowRight className="h-4 w-4" />
              Join Game
            </Button>
          </Card>

          <Link href="/game/spectate">
            <Card variant="glass" interactive className="flex items-center justify-center gap-3 p-4">
              <Eye className="h-5 w-5 text-primary" />
              <span className="font-semibold">Spectate active games</span>
              <ArrowRight className="h-4 w-4 text-muted ml-auto" />
            </Card>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
