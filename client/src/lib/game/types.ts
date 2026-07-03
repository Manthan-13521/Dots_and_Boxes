export type Player = 1 | 2;
export type CellOwner = 0 | Player;

export interface GameConfig {
  rows: number;
  cols: number;
}

export interface Move {
  type: "H" | "V";
  row: number;
  col: number;
}

export interface AppliedMove {
  move: Move;
  player: Player;
  completedBoxes: [number, number][];
}

export interface GameState {
  config: GameConfig;
  horizontalEdges: boolean[][];
  verticalEdges: boolean[][];
  boxes: CellOwner[][];
  currentPlayer: Player;
  scores: [number, number];
  status: "waiting" | "playing" | "finished";
  winner: Player | 0 | null;
  lastMove: AppliedMove | null;
  moveCount: number;
  version: number;
}

export type Difficulty = "easy" | "medium" | "hard" | "expert" | "impossible";
export type GameMode = "local-2p" | "local-ai" | "local-solo" | "online" | "ranked";

export interface GameResult {
  winner: Player | 0;
  scores: [number, number];
  moveCount: number;
  totalTime: number;
}
