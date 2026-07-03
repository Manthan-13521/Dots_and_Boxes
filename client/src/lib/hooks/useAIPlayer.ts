"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";
import { getAIMoveAsync } from "@/lib/ai/bridge";
import { getValidMoves } from "@/lib/game/engine";

export function useAIPlayer() {
  const state = useGameStore((s) => s.state);
  const mode = useGameStore((s) => s.mode);
  const difficulty = useGameStore((s) => s.difficulty);
  const makeMove = useGameStore((s) => s.makeMove);
  const setThinking = useGameStore((s) => s.setThinking);
  const processingRef = useRef(false);

  useEffect(() => {
    if (
      !state ||
      state.status !== "playing" ||
      mode !== "local-ai" ||
      state.currentPlayer !== 2 ||
      processingRef.current
    ) {
      return;
    }

    processingRef.current = true;
    setThinking(true);

    let cancelled = false;

    getAIMoveAsync(state, difficulty)
      .then(({ move }) => {
        if (!cancelled) {
          makeMove(move);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const moves = getValidMoves(state);
          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            makeMove(randomMove);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          processingRef.current = false;
          setThinking(false);
        }
      });

    return () => {
      cancelled = true;
      processingRef.current = false;
      setThinking(false);
    };
  }, [state, difficulty, makeMove, setThinking, mode]);
}
