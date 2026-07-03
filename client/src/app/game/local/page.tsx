"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Board } from "@/components/game/Board";
import { Button, Card, Badge } from "@/components/ui";
import { useGameStore } from "@/stores/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Play, Trophy, Sparkles, Undo } from "lucide-react";
import Link from "next/link";
import { useAIPlayer } from "@/lib/hooks/useAIPlayer";
import { Confetti } from "@/components/shared/Confetti";
import { OnboardingOverlay } from "@/components/game/OnboardingOverlay";
import type { Move, Difficulty } from "@/lib/game/types";

const difficulties: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
  { value: "impossible", label: "Impossible" },
];

const boardSizes = [
  { value: "3x3", rows: 3, cols: 3 },
  { value: "4x4", rows: 4, cols: 4 },
  { value: "5x5", rows: 5, cols: 5 },
  { value: "6x6", rows: 6, cols: 6 },
  { value: "8x8", rows: 8, cols: 8 },
  { value: "10x10", rows: 10, cols: 10 },
];

function LocalGameContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "2p";
  const { state, startGame, makeMove, undoMove, difficulty, setDifficulty, moveHistory } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSize, setSelectedSize] = useState("5x5");
  const showResult = gameStarted && state?.status === "finished";

  useAIPlayer();

  const isAI = mode === "ai";
  const isSolo = mode === "solo";
  const displayPlayer = isSolo ? "You" : isAI ? "You" : "Player 1";

  const handleStart = useCallback(() => {
    const size = boardSizes.find((s) => s.value === selectedSize)!;
    startGame({ rows: size.rows, cols: size.cols }, isAI ? "local-ai" : "local-2p", isAI ? difficulty : undefined);
    setGameStarted(true);
  }, [selectedSize, startGame, isAI, difficulty]);

  const handleMove = useCallback(
    (move: Move) => {
      if (!state || state.status !== "playing") return;
      makeMove(move);
    },
    [state, makeMove]
  );

  if (!gameStarted) {
    return (
      <>
        <OnboardingOverlay />
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
            <h1 className="text-2xl font-bold">
              {isSolo ? "Practice" : isAI ? "vs AI" : "Local 2-Player"}
            </h1>
          </div>

          <Card variant="glass" className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Board Size</label>
              <div className="grid grid-cols-3 gap-2">
                {boardSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedSize === size.value
                        ? "bg-primary text-white shadow-soft"
                        : "bg-surface-elevated text-foreground hover:bg-border"
                    }`}
                  >
                    {size.value}
                  </button>
                ))}
              </div>
            </div>

            {isAI && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">AI Difficulty</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {difficulties.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                        difficulty === d.value
                          ? "bg-primary text-white shadow-soft"
                          : "bg-surface-elevated text-foreground hover:bg-border"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button variant="gradient" size="lg" className="w-full" onClick={handleStart}>
              <Play className="h-4 w-4" />
              Start Game
            </Button>
          </Card>
        </motion.div>
      </main>
    </>
    );
  }

  const p1Score = state?.scores[0] ?? 0;
  const p2Score = state?.scores[1] ?? 0;
  const isP1Turn = state?.currentPlayer === 1;

  return (
    <main className="min-h-dvh flex flex-col p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/game">
          <Button variant="ghost" size="icon" aria-label="Back to menu">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Badge variant="info" size="sm">
          {state?.config.rows}x{state?.config.cols}
        </Badge>
        <div className="flex items-center gap-1">
          {(isSolo || (!isAI && mode !== "ai")) && moveHistory.length > 0 && (
            <Button variant="ghost" size="icon" onClick={undoMove} aria-label="Undo last move">
              <Undo className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleStart} aria-label="Restart game">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 mb-6">
        <div className={`flex flex-col items-center gap-1 transition-opacity ${isP1Turn ? "opacity-100" : "opacity-40"}`}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--player1)" }} />
          <span className="text-sm font-medium">{displayPlayer}</span>
          <motion.span
            key={p1Score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold font-mono"
          >
            {p1Score}
          </motion.span>
        </div>

        <div className="text-muted text-sm font-mono">vs</div>

        <div className={`flex flex-col items-center gap-1 transition-opacity ${isP1Turn ? "opacity-40" : "opacity-100"}`}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--player2)" }} />
          <span className="text-sm font-medium">{isSolo ? "Opponent" : isAI ? "AI" : "Player 2"}</span>
          <motion.span
            key={p2Score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold font-mono"
          >
            {p2Score}
          </motion.span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {state && (
          <Board
            state={state}
            onMove={handleMove}
            currentPlayer={state.currentPlayer}
            disabled={state.status !== "playing"}
            className="max-w-[500px] w-full"
          />
        )}
      </div>

      <Confetti active={showResult && state?.winner !== null && state?.winner !== 0} />

      <AnimatePresence>
        {showResult && state && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-3xl p-8 max-w-sm w-full text-center shadow-elevated"
            >
              {state.winner !== 0 ? (
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              ) : (
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted" />
              )}
              <h2 className="text-2xl font-bold mb-1">
                {state.winner === 0
                  ? "Draw!"
                  : state.winner === 1
                  ? `${displayPlayer} Wins!`
                  : `${isSolo ? "Opponent" : isAI ? "AI" : "Player 2"} Wins!`}
              </h2>
              <p className="text-muted text-sm mb-6">
                {p1Score} - {p2Score} &middot; {state.moveCount} moves
              </p>
              <div className="space-y-2">
                <Button variant="gradient" size="lg" className="w-full" onClick={handleStart}>
                  <RotateCcw className="h-4 w-4" />
                  Play Again
                </Button>
                <Link href="/game">
                  <Button variant="secondary" size="lg" className="w-full">
                    Change Mode
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function LocalGamePage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </main>
    }>
      <LocalGameContent />
    </Suspense>
  );
}
