import type { GameState, Move, Player, Difficulty } from "./types";
import { getValidMoves, applyMove, evaluate } from "./engine";

const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
  impossible: 6,
};

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: Player,
): number {
  if (depth === 0 || state.status === "finished") {
    return evaluate(state, player);
  }

  const moves = getValidMoves(state);
  if (moves.length === 0) {
    return evaluate(state, player);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = applyMove(state, move, state.currentPlayer);
      if (newState === state) continue;
      const evalScore = minimax(newState, depth - 1, alpha, beta, false, player);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = applyMove(state, move, state.currentPlayer);
      if (newState === state) continue;
      const evalScore = minimax(newState, depth - 1, alpha, beta, true, player);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getRandomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

function getGreedyMove(state: GameState, player: Player): Move {
  const moves = getValidMoves(state);
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newState = applyMove(state, move, player);
    if (newState === state) continue;
    const boxCount = newState.lastMove?.completedBoxes.length ?? 0;
    if (boxCount > bestScore) {
      bestScore = boxCount;
      bestMove = move;
    }
  }

  return bestMove;
}

function orderMoves(state: GameState, moves: Move[], player: Player): Move[] {
  const scored = moves.map((move) => {
    const newState = applyMove(state, move, player);
    const boxCount = newState.lastMove?.completedBoxes.length ?? 0;
    return { move, score: boxCount };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.move);
}

function getMinimaxMove(state: GameState, depth: number, player: Player): Move {
  const moves = orderMoves(state, getValidMoves(state), player);
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newState = applyMove(state, move, state.currentPlayer);
    if (newState === state) continue;
    const score = minimax(newState, depth - 1, -Infinity, Infinity, false, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getAIMove(state: GameState, difficulty: Difficulty): Move {
  const player = state.currentPlayer;
  const moves = getValidMoves(state);

  if (moves.length === 0) {
    throw new Error("No valid moves available");
  }

  if (moves.length === 1) {
    return moves[0];
  }

  switch (difficulty) {
    case "easy":
      return getRandomMove(moves);

    case "medium":
      return getGreedyMove(state, player);

    case "hard":
      return getMinimaxMove(state, 2, player);

    case "expert":
      return getMinimaxMove(state, DIFFICULTY_DEPTH.expert, player);

    case "impossible":
      return getMinimaxMove(state, DIFFICULTY_DEPTH.impossible, player);

    default:
      return getGreedyMove(state, player);
  }
}
