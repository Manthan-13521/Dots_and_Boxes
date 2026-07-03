"use client";

import { Card } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { motion } from "framer-motion";
import { Users, Bot, Globe, Gamepad2 } from "lucide-react";
import Link from "next/link";

const modes = [
  { icon: Users, title: "Local 2-Player", description: "Play with a friend on the same device", href: "/game/local?mode=2p" },
  { icon: Bot, title: "vs AI", description: "Challenge the computer", href: "/game/local?mode=ai" },
  { icon: Globe, title: "Online", description: "Battle players worldwide", href: "/game/online" },
  { icon: Gamepad2, title: "Practice", description: "Play alone", href: "/game/local?mode=solo" },
];

const iconColors = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-cyan-500 to-teal-500",
  "from-orange-500 to-red-500",
];

export default function GameHub() {
  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl font-extrabold text-center mb-3 bg-gradient-to-r from-primary to-cyan-neon bg-clip-text text-transparent"
          >
            Choose Game Mode
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-muted mb-10"
          >
            Select how you want to play
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modes.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={mode.href}>
                  <Card variant="glass" interactive className="group flex flex-col items-center text-center p-8 relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${iconColors[i]} blur-3xl`} />
                    <mode.icon className="h-12 w-12 text-primary mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <h2 className="text-xl font-bold mb-2 relative z-10">{mode.title}</h2>
                    <p className="text-sm text-muted relative z-10">{mode.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
