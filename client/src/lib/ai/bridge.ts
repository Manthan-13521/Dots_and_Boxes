import type { GameState, Move, Difficulty } from "@/lib/game/types";

interface AIResponse {
  id: string;
  move: Move;
  completedBoxes: number;
  timeMs: number;
  score?: number;
  error?: string;
}

let worker: Worker | null = null;
let currentId = 0;

const pendingRequests = new Map<
  string,
  { resolve: (value: AIResponse) => void; reject: (reason: Error) => void }
>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./ai.worker.ts", import.meta.url));

  worker.onmessage = (e: MessageEvent<AIResponse>) => {
    const { id, error } = e.data;
    const pending = pendingRequests.get(id);
    if (!pending) return;
    pendingRequests.delete(id);
    if (error) {
      pending.reject(new Error(error));
    } else {
      pending.resolve(e.data);
    }
  };

  worker.onerror = (err) => {
    for (const [id, pending] of pendingRequests) {
      pending.reject(new Error(`Worker error: ${err.message || "unknown"}`));
      pendingRequests.delete(id);
    }
  };

  return worker;
}

export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  for (const [id, pending] of pendingRequests) {
    pending.reject(new Error("Worker terminated"));
    pendingRequests.delete(id);
  }
}

export function getAIMoveAsync(
  state: GameState,
  difficulty: Difficulty,
): Promise<AIResponse> {
  const id = `ai_${++currentId}`;
  const timeoutMs = difficulty === "impossible" ? 10000 : 5000;

  return new Promise((resolve, reject) => {
    try {
      const w = getWorker();
      pendingRequests.set(id, { resolve, reject });
      w.postMessage({ id, state, difficulty });
    } catch (err) {
      reject(err);
      return;
    }

    setTimeout(() => {
      const pending = pendingRequests.get(id);
      if (pending) {
        pending.reject(new Error(`AI move timeout (${timeoutMs}ms)`));
        pendingRequests.delete(id);
        terminateWorker();
      }
    }, timeoutMs);
  });
}
