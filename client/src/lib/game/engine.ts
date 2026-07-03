import type { GameState, GameConfig, Move, Player, CellOwner } from "./types";

export function createInitialState(config: GameConfig): GameState {
  const { rows, cols } = config;
  return {
    config,
    horizontalEdges: Array.from({ length: rows + 1 }, () => Array(cols).fill(false)),
    verticalEdges: Array.from({ length: rows }, () => Array(cols + 1).fill(false)),
    boxes: Array.from({ length: rows }, () => Array(cols).fill(0) as CellOwner[]),
    currentPlayer: 1,
    scores: [0, 0],
    status: "playing",
    winner: null,
    lastMove: null,
    moveCount: 0,
  };
}

export function getValidMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  const { rows, cols } = state.config;

  for (let r = 0; r < rows + 1; r++) {
    for (let c = 0; c < cols; c++) {
      if (!state.horizontalEdges[r][c]) {
        moves.push({ type: "H", row: r, col: c });
      }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols + 1; c++) {
      if (!state.verticalEdges[r][c]) {
        moves.push({ type: "V", row: r, col: c });
      }
    }
  }
  return moves;
}

export function countCaptureChains(state: GameState): [number, number] {
  const validMoves = getValidMoves(state);
  let p1Captures = 0;
  let p2Captures = 0;

  for (const move of validMoves) {
    const result = applyMove(state, move, state.currentPlayer);
    const boxCount = result.lastMove!.completedBoxes.length;
    if (state.currentPlayer === 1) {
      p1Captures += boxCount;
    } else {
      p2Captures += boxCount;
    }
  }
  return [p1Captures, p2Captures];
}

function getSurroundingBoxes(state: GameState, move: Move): [number, number][] {
  const boxes: [number, number][] = [];
  const { rows, cols } = state.config;

  if (move.type === "H") {
    if (move.row > 0) boxes.push([move.row - 1, move.col]);
    if (move.row < rows) boxes.push([move.row, move.col]);
  } else {
    if (move.col > 0) boxes.push([move.row, move.col - 1]);
    if (move.col < cols) boxes.push([move.row, move.col]);
  }
  return boxes;
}

function isBoxComplete(state: GameState, row: number, col: number): boolean {
  const { rows, cols } = state.config;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
  return (
    state.horizontalEdges[row][col] &&
    state.horizontalEdges[row + 1][col] &&
    state.verticalEdges[row][col] &&
    state.verticalEdges[row][col + 1]
  );
}

export function applyMove(state: GameState, move: Move, player: Player): GameState {
  if (state.status !== "playing") return state;
  if (player !== state.currentPlayer) return state;

  const newState: GameState = {
    ...state,
    horizontalEdges: state.horizontalEdges.map((row) => [...row]),
    verticalEdges: state.verticalEdges.map((row) => [...row]),
    boxes: state.boxes.map((row) => [...row]),
    scores: [...state.scores] as [number, number],
    lastMove: null,
  };

  if (move.type === "H") {
    if (newState.horizontalEdges[move.row][move.col]) return state;
    newState.horizontalEdges[move.row][move.col] = true;
  } else {
    if (newState.verticalEdges[move.row][move.col]) return state;
    newState.verticalEdges[move.row][move.col] = true;
  }

  const surroundingBoxes = getSurroundingBoxes(newState, move);
  const completedBoxes: [number, number][] = [];

  for (const [br, bc] of surroundingBoxes) {
    if (isBoxComplete(newState, br, bc) && newState.boxes[br][bc] === 0) {
      newState.boxes[br][bc] = player;
      newState.scores[player - 1]++;
      completedBoxes.push([br, bc]);
    }
  }

  newState.lastMove = { move, player, completedBoxes };
  newState.moveCount = state.moveCount + 1;

  if (completedBoxes.length === 0) {
    newState.currentPlayer = player === 1 ? 2 : 1;
  }

  const totalBoxes = newState.config.rows * newState.config.cols;
  const claimedBoxes = newState.scores[0] + newState.scores[1];

  if (claimedBoxes >= totalBoxes) {
    newState.status = "finished";
    if (newState.scores[0] > newState.scores[1]) {
      newState.winner = 1;
    } else if (newState.scores[1] > newState.scores[0]) {
      newState.winner = 2;
    } else {
      newState.winner = 0;
    }
  }

  return newState;
}

export function evaluate(state: GameState, player: Player): number {
  const opponent: Player = player === 1 ? 2 : 1;
  const myScore = state.scores[player - 1];
  const oppScore = state.scores[opponent - 1];
  const scoreDiff = (myScore - oppScore) * 10;

  const validMoves = getValidMoves(state);

  let capturesCount = 0;
  let oppCapturesCount = 0;
  for (const move of validMoves) {
    const result = applyMove(state, move, player);
    if (result.lastMove) capturesCount += result.lastMove.completedBoxes.length;

    const oppResult = applyMove(state, move, opponent);
    if (oppResult.lastMove) oppCapturesCount += oppResult.lastMove.completedBoxes.length;
  }

  const captureAdvantage = (capturesCount - oppCapturesCount) * 3;

  let chainBonus = 0;
  for (const move of validMoves) {
    const result = applyMove(state, move, player);
    if (result.lastMove && result.lastMove.completedBoxes.length > 1) {
      chainBonus += 5;
    }
  }

  return scoreDiff + captureAdvantage + chainBonus;
}

export function isGameOver(state: GameState): boolean {
  return state.status === "finished";
}

export function getWinner(state: GameState): Player | 0 | null {
  return state.winner;
}

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(data: string): GameState {
  return JSON.parse(data);
}
