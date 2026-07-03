import { create } from "zustand";
import type { GameState, GameConfig, Move, Difficulty, GameMode, Player } from "@/lib/game/types";
import { createInitialState, applyMove, getValidMoves } from "@/lib/game/engine";
import { useReplayStore, type ReplayData } from "./replayStore";

interface RecordedMove {
  move: Move;
  player: Player;
}

interface GameStore {
  state: GameState | null;
  config: GameConfig;
  mode: GameMode;
  difficulty: Difficulty;
  isThinking: boolean;
  moveHistory: GameState[];
  recordedMoves: RecordedMove[];
  gameStartTime: number;

  startGame: (config: GameConfig, mode: GameMode, difficulty?: Difficulty) => void;
  makeMove: (move: Move) => void;
  undoMove: () => void;
  resetGame: () => void;
  setDifficulty: (d: Difficulty) => void;
  setMode: (m: GameMode) => void;
  setThinking: (t: boolean) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  config: { rows: 5, cols: 5 },
  mode: "local-2p",
  difficulty: "medium",
  isThinking: false,
  moveHistory: [],
  recordedMoves: [],
  gameStartTime: 0,

  startGame: (config, mode, difficulty) => {
    set({
      config,
      mode,
      difficulty: difficulty || get().difficulty,
      state: createInitialState(config),
      isThinking: false,
      moveHistory: [],
      recordedMoves: [],
      gameStartTime: Date.now(),
    });
  },

  makeMove: (move) => {
    const { state, moveHistory, recordedMoves } = get();
    if (!state || state.status !== "playing") return;

    const validMoves = getValidMoves(state);
    const isValid = validMoves.some((m) => m.type === move.type && m.row === move.row && m.col === move.col);
    if (!isValid) return;

    const newState = applyMove(state, move, state.currentPlayer);
    set({
      state: newState,
      moveHistory: [...moveHistory, state],
      recordedMoves: [...recordedMoves, { move, player: state.currentPlayer }],
    });

    if (newState.status === "finished") {
      const { config, recordedMoves: moves, gameStartTime } = get();
      const totalTime = Date.now() - gameStartTime;
      const replay: ReplayData = {
        id: Math.random().toString(36).slice(2, 10),
        config,
        players: ["Player 1", "Player 2"],
        moves: moves.map((m) => ({ move: m.move, player: m.player })),
        timestamps: moves.map((_, i) => i * 1000),
        result: {
          winner: newState.winner ?? 0,
          scores: [...newState.scores] as [number, number],
          moveCount: newState.moveCount,
          totalTime,
        },
        createdAt: Date.now(),
      };
      try {
        useReplayStore.getState().addReplay(replay);
      } catch {}
    }
  },

  undoMove: () => {
    const { state, moveHistory, recordedMoves, mode } = get();
    if (mode !== "local-solo" && mode !== "local-2p") return;
    if (moveHistory.length === 0 || !state) return;

    set({
      state: moveHistory[moveHistory.length - 1],
      moveHistory: moveHistory.slice(0, -1),
      recordedMoves: recordedMoves.slice(0, -1),
    });
  },

  resetGame: () => {
    const { config } = get();
    set({
      state: createInitialState(config),
      isThinking: false,
      moveHistory: [],
      recordedMoves: [],
      gameStartTime: Date.now(),
    });
  },

  setDifficulty: (difficulty) => set({ difficulty }),
  setMode: (mode) => set({ mode }),
  setThinking: (isThinking) => set({ isThinking }),
}));
