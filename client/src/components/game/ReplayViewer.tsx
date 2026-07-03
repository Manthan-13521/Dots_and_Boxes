"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Board } from "@/components/game/Board";
import { Button } from "@/components/ui";
import { createInitialState, applyMove } from "@/lib/game/engine";
import type { ReplayData } from "@/stores/replayStore";
import type { GameState } from "@/lib/game/types";
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";

interface ReplayViewerProps {
  replay: ReplayData;
  onClose: () => void;
}

export function ReplayViewer({ replay, onClose }: ReplayViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalMoves = replay.moves.length;

  const gameStates = useMemo(() => {
    const states: GameState[] = [createInitialState(replay.config)];
    for (const { move, player } of replay.moves) {
      const lastState = states[states.length - 1];
      states.push(applyMove(lastState, move, player));
    }
    return states;
  }, [replay]);

  const currentState = gameStates[currentIndex];

  const handlePlayPause = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const handleStepBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleStepForward = useCallback(() => {
    setCurrentIndex((i) => Math.min(totalMoves, i + 1));
  }, [totalMoves]);

  const handleSkipStart = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const handleSkipEnd = useCallback(() => {
    setCurrentIndex(totalMoves);
  }, [totalMoves]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((i) => {
          if (i >= totalMoves) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 1000 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, totalMoves]);

  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          Move {currentIndex} of {totalMoves}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex justify-center">
        <Board
          state={currentState}
          onMove={() => {}}
          currentPlayer={currentState.currentPlayer}
          disabled
          className="max-w-[400px] w-full"
        />
      </div>

      <div className="flex items-center justify-center gap-1">
        <Button variant="ghost" size="icon" onClick={handleSkipStart} aria-label="Go to start">
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleStepBack} aria-label="Step back">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="primary" size="icon" onClick={handlePlayPause} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleStepForward} aria-label="Step forward">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSkipEnd} aria-label="Go to end">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
              speed === s
                ? "bg-primary text-white"
                : "bg-surface-elevated text-muted hover:text-foreground"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="font-mono">
          {replay.result.scores[0]} - {replay.result.scores[1]}
        </span>
        <span className="text-muted">
          {replay.config.rows}x{replay.config.cols}
        </span>
      </div>
    </div>
  );
}
