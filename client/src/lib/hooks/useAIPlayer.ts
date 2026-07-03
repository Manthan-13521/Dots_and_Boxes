"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { getAIMoveAsync } from "@/lib/ai/bridge";
import { getValidMoves } from "@/lib/game/engine";

export function useAIPlayer() {
  const { state, mode, difficulty, makeMove } = useGameStore();
  const processingRef = useRef(false);
  const [isThinking, setIsThinking] = useState(false);

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
    setIsThinking(true);

    let cancelled = false;

    getAIMoveAsync(state, difficulty)
      .then(({ move }) => {
        if (!cancelled) {
          makeMove(move);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("AI error, making random move:", err.message);
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
          setIsThinking(false);
        }
      });

    return () => {
      cancelled = true;
      processingRef.current = false;
      setIsThinking(false);
    };
  }, [state, state?.currentPlayer, state?.status, mode, difficulty, makeMove]);

  return { isThinking };
}
