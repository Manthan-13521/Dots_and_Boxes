import { create } from "zustand";
import type { GameConfig, Move, Player, GameResult } from "@/lib/game/types";

export interface ReplayData {
  id: string;
  config: GameConfig;
  players: [string, string];
  moves: { move: Move; player: Player }[];
  timestamps: number[];
  result: GameResult;
  createdAt: number;
}

interface ReplayStore {
  replays: ReplayData[];
  addReplay: (replay: ReplayData) => void;
  removeReplay: (id: string) => void;
  exportReplay: (id: string) => string;
  importReplay: (json: string) => ReplayData | null;
  clearReplays: () => void;
}

function saveToStorage(replays: ReplayData[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("replays", JSON.stringify(replays.slice(0, 20)));
  } catch {}
}

function loadFromStorage(): ReplayData[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("replays");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export const useReplayStore = create<ReplayStore>((set, get) => ({
  replays: loadFromStorage(),

  addReplay: (replay) => {
    set((state) => {
      const replays = [replay, ...state.replays].slice(0, 20);
      saveToStorage(replays);
      return { replays };
    });
  },

  removeReplay: (id) => {
    set((state) => {
      const replays = state.replays.filter((r) => r.id !== id);
      saveToStorage(replays);
      return { replays };
    });
  },

  exportReplay: (id) => {
    const replay = get().replays.find((r) => r.id === id);
    if (!replay) return "";
    return JSON.stringify(replay, null, 2);
  },

  importReplay: (json) => {
    try {
      const data = JSON.parse(json) as ReplayData;
      if (!data.config || !data.moves || !data.result) return null;
      get().addReplay(data);
      return data;
    } catch {
      return null;
    }
  },

  clearReplays: () => {
    set({ replays: [] });
    saveToStorage([]);
  },
}));
