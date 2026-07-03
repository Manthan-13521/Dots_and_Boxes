import { describe, it, expect } from "vitest";
import { createInitialState, getValidMoves, applyMove, evaluate, isGameOver } from "@/lib/game/engine";
import type { GameState } from "@/lib/game/types";

function createFreshBoard(rows = 3, cols = 3): GameState {
  return createInitialState({ rows, cols });
}

describe("Game Engine", () => {
  describe("createInitialState", () => {
    it("creates a board with correct dimensions", () => {
      const state = createFreshBoard(5, 5);
      expect(state.config.rows).toBe(5);
      expect(state.config.cols).toBe(5);
      expect(state.horizontalEdges.length).toBe(6);
      expect(state.horizontalEdges[0].length).toBe(5);
      expect(state.verticalEdges.length).toBe(5);
      expect(state.verticalEdges[0].length).toBe(6);
      expect(state.boxes.length).toBe(5);
      expect(state.boxes[0].length).toBe(5);
    });

    it("starts with all edges unclaimed", () => {
      const state = createFreshBoard();
      for (const row of state.horizontalEdges) {
        for (const edge of row) {
          expect(edge).toBe(false);
        }
      }
      for (const row of state.verticalEdges) {
        for (const edge of row) {
          expect(edge).toBe(false);
        }
      }
    });

    it("starts with player 1", () => {
      const state = createFreshBoard();
      expect(state.currentPlayer).toBe(1);
    });

    it("starts with zero scores", () => {
      const state = createFreshBoard();
      expect(state.scores).toEqual([0, 0]);
    });
  });

  describe("getValidMoves", () => {
    it("returns correct number of moves for 3x3 board", () => {
      const state = createFreshBoard(3, 3);
      const moves = getValidMoves(state);
      const horizontalCount = 4 * 3;
      const verticalCount = 3 * 4;
      expect(moves.length).toBe(horizontalCount + verticalCount);
    });

    it("returns correct number of moves for 5x5 board", () => {
      const state = createFreshBoard(5, 5);
      const moves = getValidMoves(state);
      expect(moves.length).toBe(6 * 5 + 5 * 6);
    });

    it("excludes claimed edges", () => {
      const state = createFreshBoard(3, 3);
      const firstMove = state.horizontalEdges;
      firstMove[0][0] = true;
      const moves = getValidMoves(state);
      const hasClaimed = moves.some((m) => m.type === "H" && m.row === 0 && m.col === 0);
      expect(hasClaimed).toBe(false);
    });
  });

  describe("applyMove", () => {
    it("places a horizontal edge", () => {
      let state = createFreshBoard();
      state = applyMove(state, { type: "H", row: 0, col: 0 }, 1);
      expect(state.horizontalEdges[0][0]).toBe(true);
    });

    it("places a vertical edge", () => {
      let state = createFreshBoard();
      state = applyMove(state, { type: "V", row: 0, col: 0 }, 1);
      expect(state.verticalEdges[0][0]).toBe(true);
    });

    it("switches player when no box is completed", () => {
      let state = createFreshBoard();
      state = applyMove(state, { type: "H", row: 0, col: 0 }, 1);
      expect(state.currentPlayer).toBe(2);
    });

    it("does not switch player when a box is completed", () => {
      let state = createFreshBoard(2, 2);

      state = applyMove(state, { type: "H", row: 0, col: 0 }, 1);
      expect(state.currentPlayer).toBe(2);
      state = applyMove(state, { type: "V", row: 0, col: 0 }, 2);
      expect(state.currentPlayer).toBe(1);
      state = applyMove(state, { type: "V", row: 0, col: 1 }, 1);
      expect(state.currentPlayer).toBe(2);
      state = applyMove(state, { type: "H", row: 2, col: 0 }, 2);
      expect(state.currentPlayer).toBe(1);
      state = applyMove(state, { type: "H", row: 1, col: 0 }, 1);

      const completed = state.lastMove!.completedBoxes;
      expect(completed.length).toBe(1);
      expect(completed[0]).toEqual([0, 0]);
      expect(state.boxes[0][0]).toBe(1);
      expect(state.currentPlayer).toBe(1);
      expect(state.scores[0]).toBe(1);
    });

    it("rejects moves on claimed edges", () => {
      let state = createFreshBoard();
      state = applyMove(state, { type: "H", row: 0, col: 0 }, 1);
      const result = applyMove(state, { type: "H", row: 0, col: 0 }, 2);
      expect(result).toBe(state);
    });

    it("detects game over when all boxes are claimed", () => {
      let state = createFreshBoard(2, 2);
      const moves = getValidMoves(state);
      for (const move of moves) {
        state = applyMove(state, move, state.currentPlayer);
      }
      expect(state.status).toBe("finished");
    });
  });

  describe("evaluate", () => {
    it("returns a number", () => {
      const state = createFreshBoard();
      const score = evaluate(state, 1);
      expect(typeof score).toBe("number");
    });
  });

  describe("isGameOver", () => {
    it("returns false for a new game", () => {
      const state = createFreshBoard();
      expect(isGameOver(state)).toBe(false);
    });
  });
});
