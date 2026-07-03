import type { GameState, Move, Player, Difficulty } from "@/lib/game/types";
import { getValidMoves, applyMove, evaluate } from "@/lib/game/engine";

const DIFFICULTY_CONFIG: Record<Difficulty, { maxDepth: number; timeLimit: number }> = {
  easy: { maxDepth: 0, timeLimit: 100 },
  medium: { maxDepth: 0, timeLimit: 100 },
  hard: { maxDepth: 2, timeLimit: 500 },
  expert: { maxDepth: 3, timeLimit: 1500 },
  impossible: { maxDepth: 4, timeLimit: 3000 },
};

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  player: Player,
  startTime: number,
  timeLimit: number,
): number {
  if (Date.now() - startTime > timeLimit) return evaluate(state, player);
  if (depth === 0 || state.status === "finished") return evaluate(state, player);

  const moves = getValidMoves(state);
  if (moves.length === 0) return evaluate(state, player);

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const ns = applyMove(state, move, state.currentPlayer);
      if (ns === state) continue;
      const val = minimax(ns, depth - 1, alpha, beta, false, player, startTime, timeLimit);
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const ns = applyMove(state, move, state.currentPlayer);
      if (ns === state) continue;
      const val = minimax(ns, depth - 1, alpha, beta, true, player, startTime, timeLimit);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(state: GameState, depth: number, player: Player, startTime: number, timeLimit: number): { move: Move; score: number } {
  const moves = getValidMoves(state);
  const scored = moves.map((m) => {
    const ns = applyMove(state, m, player);
    const captures = ns.lastMove?.completedBoxes.length ?? 0;
    return { move: m, captures };
  });
  scored.sort((a, b) => b.captures - a.captures);

  let bestMove = scored[0].move;
  let bestScore = -Infinity;

  for (const { move } of scored) {
    if (Date.now() - startTime > timeLimit * 0.8) break;
    const ns = applyMove(state, move, state.currentPlayer);
    if (ns === state) continue;
    const val = minimax(ns, depth - 1, -Infinity, Infinity, false, player, startTime, timeLimit);
    if (val > bestScore) {
      bestScore = val;
      bestMove = move;
    }
  }
  return { move: bestMove, score: bestScore };
}

self.onmessage = (e: MessageEvent<{ id: string; state: GameState; difficulty: Difficulty }>) => {
  const { id, state, difficulty } = e.data;
  const startTime = Date.now();
  const config = DIFFICULTY_CONFIG[difficulty];

  try {
    const moves = getValidMoves(state);
    if (moves.length === 0) {
      self.postMessage({ id, error: "No valid moves" });
      return;
    }
    if (moves.length === 1) {
      self.postMessage({ id, move: moves[0], completedBoxes: 0, timeMs: Date.now() - startTime });
      return;
    }
    if (difficulty === "easy") {
      const move = moves[Math.floor(Math.random() * moves.length)];
      self.postMessage({ id, move, completedBoxes: 0, timeMs: Date.now() - startTime });
      return;
    }
    if (difficulty === "medium") {
      let best = moves[0];
      let bestCaps = -1;
      for (const m of moves) {
        const ns = applyMove(state, m, state.currentPlayer);
        const caps = ns.lastMove?.completedBoxes.length ?? 0;
        if (caps > bestCaps) { bestCaps = caps; best = m; }
      }
      self.postMessage({ id, move: best, completedBoxes: bestCaps, timeMs: Date.now() - startTime });
      return;
    }

    const result = getBestMove(state, config.maxDepth, state.currentPlayer, startTime, config.timeLimit);
    const finalState = applyMove(state, result.move, state.currentPlayer);
    const completedBoxes = finalState.lastMove?.completedBoxes.length ?? 0;

    self.postMessage({
      id,
      move: result.move,
      completedBoxes,
      timeMs: Date.now() - startTime,
      score: result.score,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    self.postMessage({ id, error: errorMsg });
  }
};
