"use client";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface TurnBannerProps {
  currentPlayer: 1 | 2;
  playerNumber: 1 | 2 | null;
  labels: { 1: string; 2: string };
  gameStatus: "playing" | "finished" | "waiting";
  isSpectator?: boolean;
  className?: string;
}

function getTurnLabel(currentPlayer: 1 | 2, playerNumber: 1 | 2 | null, labels: { 1: string; 2: string }, isSpectator: boolean): {
  title: string;
  subtitle: string;
} {
  if (isSpectator) {
    return {
      title: `SPECTATING`,
      subtitle: `${labels[currentPlayer]}'s turn`,
    };
  }

  if (playerNumber === null) {
    return {
      title: `${labels[currentPlayer]}'s TURN`,
      subtitle: "",
    };
  }

  if (currentPlayer === playerNumber) {
    return {
      title: "YOUR TURN",
      subtitle: "",
    };
  }

  return {
    title: "OPPONENT'S TURN",
    subtitle: "",
  };
}

export function TurnBanner({ currentPlayer, playerNumber, labels, gameStatus, isSpectator = false, className }: TurnBannerProps) {
  const reducedMotion = useReducedMotion();

  const isMyTurn = playerNumber !== null && currentPlayer === playerNumber && !isSpectator;
  const isOpponentTurn = playerNumber !== null && currentPlayer !== playerNumber && !isSpectator && !isSpectator;
  const isLocalTurn = playerNumber === null && !isSpectator;

  const turnInfo = getTurnLabel(currentPlayer, playerNumber, labels, isSpectator);

  if (gameStatus !== "playing") {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`turn-${currentPlayer}-${isMyTurn ? "mine" : "theirs"}`}
        initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        exit={reducedMotion ? {} : { opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl px-6 py-5 sm:py-6",
          "flex flex-col items-center justify-center gap-1",
          isMyTurn && "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/30",
          isOpponentTurn && "bg-gradient-to-r from-red-900 via-red-800 to-rose-900 shadow-[0_0_25px_rgba(220,38,38,0.3)] border border-red-500/20",
          isLocalTurn && currentPlayer === 1 && "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/30",
          isLocalTurn && currentPlayer === 2 && "bg-gradient-to-r from-red-900 via-red-800 to-rose-900 shadow-[0_0_25px_rgba(220,38,38,0.3)] border border-red-500/20",
          className
        )}
        role="status"
        aria-live="assertive"
        aria-label={turnInfo.title}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={reducedMotion ? {} : { opacity: 0 }}
          animate={reducedMotion ? {} : {
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={reducedMotion ? {} : {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: isMyTurn || (isLocalTurn && currentPlayer === 1)
              ? "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.3) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-1">
          {(isMyTurn || (isLocalTurn && currentPlayer === 1)) && (
            <motion.div
              className="text-3xl sm:text-4xl"
              initial={reducedMotion ? {} : { scale: 0.8 }}
              animate={reducedMotion ? {} : { scale: 1 }}
              transition={reducedMotion ? {} : {
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
            >
              🎮
            </motion.div>
          )}
          {(isOpponentTurn || (isLocalTurn && currentPlayer === 2)) && (
            <motion.div
              className="text-3xl sm:text-4xl drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
              animate={reducedMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={reducedMotion ? {} : {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ⏳
            </motion.div>
          )}
          {isSpectator && (
            <motion.div
              className="text-3xl sm:text-4xl"
              animate={reducedMotion ? {} : { scale: [1, 1.05, 1] }}
              transition={reducedMotion ? {} : {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              👁️
            </motion.div>
          )}

          <motion.h2
            className={cn(
              "text-xl sm:text-2xl font-extrabold tracking-wide text-center",
              "text-white drop-shadow-lg",
            )}
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={reducedMotion ? {} : { delay: 0.1, duration: 0.3 }}
          >
            {turnInfo.title}
          </motion.h2>

          {turnInfo.subtitle && (
            <motion.p
              className="text-sm sm:text-base font-medium text-white/70"
              initial={reducedMotion ? {} : { opacity: 0 }}
              animate={reducedMotion ? {} : { opacity: 1 }}
              transition={reducedMotion ? {} : { delay: 0.2, duration: 0.3 }}
            >
              {turnInfo.subtitle}
            </motion.p>
          )}
        </div>

        <div
          className={cn(
            "absolute inset-0 rounded-2xl pointer-events-none",
            isMyTurn && "shadow-[inset_0_0_30px_rgba(59,130,246,0.5),0_0_20px_rgba(59,130,246,0.4)]",
            isOpponentTurn && "shadow-[inset_0_0_30px_rgba(239,68,68,0.4),0_0_20px_rgba(239,68,68,0.3)]",
            isLocalTurn && currentPlayer === 1 && "shadow-[inset_0_0_30px_rgba(59,130,246,0.5),0_0_20px_rgba(59,130,246,0.4)]",
            isLocalTurn && currentPlayer === 2 && "shadow-[inset_0_0_30px_rgba(239,68,68,0.4),0_0_20px_rgba(239,68,68,0.3)]",
          )}
        />
      </motion.div>
    </AnimatePresence>
  );
}
