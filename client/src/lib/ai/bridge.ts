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
    const entries = Array.from(pendingRequests.entries());
    pendingRequests.clear();
    for (const [, pending] of entries) {
      pending.reject(new Error(`Worker error: ${err.message || "unknown"}`));
    }
    worker?.terminate();
    worker = null;
  };

  return worker;
}

export function terminateWorker() {
  const entries = Array.from(pendingRequests.entries());
  pendingRequests.clear();
  if (worker) {
    worker.terminate();
    worker = null;
  }
  for (const [, pending] of entries) {
    pending.reject(new Error("Worker terminated"));
  }
}

export function getAIMoveAsync(
  state: GameState,
  difficulty: Difficulty,
): Promise<AIResponse> {
  const id = `ai_${++currentId}`;
  const timeoutMs = difficulty === "impossible" ? 10000 : 5000;

  const timeoutId = setTimeout(() => {
    const pending = pendingRequests.get(id);
    if (pending) {
      pendingRequests.delete(id);
      pending.reject(new Error(`AI move timeout (${timeoutMs}ms)`));
    }
  }, timeoutMs);

  return new Promise((resolve, reject) => {
    try {
      const w = getWorker();
      const wrappedResolve = (value: AIResponse) => {
        clearTimeout(timeoutId);
        resolve(value);
      };
      const wrappedReject = (reason: Error) => {
        clearTimeout(timeoutId);
        reject(reason);
      };
      pendingRequests.set(id, { resolve: wrappedResolve, reject: wrappedReject });
      w.postMessage({ id, state, difficulty });
    } catch (err) {
      clearTimeout(timeoutId);
      reject(err);
    }
  });
}
