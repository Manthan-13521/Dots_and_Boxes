"use client";

import { Card } from "@/components/ui";
import { motion } from "framer-motion";
import { Users, Bot, Globe, Gamepad2 } from "lucide-react";
import Link from "next/link";

const modes = [
  { icon: Users, title: "Local 2-Player", description: "Play with a friend on the same device", href: "/game/local?mode=2p" },
  { icon: Bot, title: "vs AI", description: "Challenge the computer", href: "/game/local?mode=ai" },
  { icon: Globe, title: "Online", description: "Battle players worldwide", href: "/game/online" },
  { icon: Gamepad2, title: "Practice", description: "Play alone", href: "/game/local?mode=solo" },
];

export default function GameHub() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Choose Game Mode</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modes.map((mode) => (
            <Link key={mode.title} href={mode.href}>
              <Card variant="glass" interactive className="flex flex-col items-center text-center p-8">
                <mode.icon className="h-10 w-10 text-primary mb-4" />
                <h2 className="text-lg font-semibold mb-2">{mode.title}</h2>
                <p className="text-sm text-muted">{mode.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
