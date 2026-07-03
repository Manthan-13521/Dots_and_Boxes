"use client";

import { useEffect, useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
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
    <main className="min-h-dvh flex flex-col p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/game/online">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Spectate</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto space-y-4"
      >
        {loading ? (
          <Card variant="glass" className="p-8 text-center">
            <Monitor className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse" />
            <p className="text-muted">Looking for active games...</p>
          </Card>
        ) : rooms.length === 0 ? (
          <Card variant="glass" className="p-8 text-center">
            <Eye className="h-8 w-8 text-muted mx-auto mb-3" />
            <h2 className="font-semibold mb-1">No Active Games</h2>
            <p className="text-sm text-muted">There are no games to spectate right now</p>
          </Card>
        ) : (
          rooms.map((room) => (
            <Link key={room.code} href={`/game/online/${room.code}?spectate=1`}>
              <Card variant="glass" interactive className="flex items-center justify-between p-4">
                <div>
                  <span className="font-mono font-bold tracking-widest">{room.code}</span>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted">
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
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Watch
                </Button>
              </Card>
            </Link>
          ))
        )}
      </motion.div>
    </main>
  );
}
