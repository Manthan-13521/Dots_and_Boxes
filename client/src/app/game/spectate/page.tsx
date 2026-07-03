"use client";

import { useEffect, useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Users, Monitor } from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

interface RoomInfo {
  code: string;
  playerCount: number;
  spectatorCount: number;
  config: { rows: number; cols: number };
}

export default function SpectatePage() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      socket.emit("rooms:list");
    });

    socket.on("rooms:list", (data: RoomInfo[]) => {
      setRooms(data);
      setLoading(false);
    });

    socket.on("rooms:updated", (data: RoomInfo[]) => {
      setRooms(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      <main className="relative z-10 flex-1 flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8 max-w-lg mx-auto w-full">
          <Link href="/game/online">
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-neon bg-clip-text text-transparent">
              Spectate
            </h1>
            <p className="text-sm text-muted">Watch active games</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg mx-auto space-y-4"
        >
          {loading ? (
            <Card variant="glass" className="p-8 text-center">
              <Monitor className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse" />
              <p className="text-muted">Looking for active games...</p>
            </Card>
          ) : rooms.length === 0 ? (
            <Card variant="glass" className="p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <Eye className="h-10 w-10 text-muted mx-auto mb-3" />
              <h2 className="font-bold text-lg mb-1">No Active Games</h2>
              <p className="text-sm text-muted">There are no games to spectate right now</p>
            </Card>
          ) : (
            rooms.map((room, i) => (
              <motion.div
                key={room.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/game/online/${room.code}?spectate=1`}>
                  <Card variant="glass" interactive className="flex items-center justify-between p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <div>
                      <span className="font-mono font-extrabold tracking-widest text-primary">{room.code}</span>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {room.playerCount}/2
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {room.spectatorCount}
                        </span>
                        <Badge variant="info" size="sm">
                          {room.config.rows}x{room.config.cols}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  );
}
