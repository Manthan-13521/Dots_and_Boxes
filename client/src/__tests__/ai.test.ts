import { describe, it, expect } from "vitest";
import { getAIMove } from "@/lib/game/ai";
import { createInitialState, applyMove } from "@/lib/game/engine";
import type { Difficulty } from "@/lib/game/types";

function createFreshBoard(rows = 3, cols = 3) {
  return createInitialState({ rows, cols });
}

describe("AI", () => {
  describe("getAIMove", () => {
    const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert", "impossible"];

    for (const diff of difficulties) {
      it(`returns a valid move for ${diff} difficulty`, () => {
        const state = createFreshBoard(2, 2);
        const move = getAIMove(state, diff);
        expect(move).toBeDefined();
        expect(move.type).toMatch(/^[HV]$/);
        expect(typeof move.row).toBe("number");
        expect(typeof move.col).toBe("number");
        const newState = applyMove(state, move, state.currentPlayer);
        expect(newState).not.toBe(state);
      });
    }

    it("throws error when no moves available", { timeout: 5000 }, () => {
      const state = createFreshBoard(1, 1);
      const moves = [
        { type: "H" as const, row: 0, col: 0 },
        { type: "H" as const, row: 1, col: 0 },
        { type: "V" as const, row: 0, col: 0 },
        { type: "V" as const, row: 0, col: 1 },
      ];
      let finalState = state;
      for (const m of moves) {
        finalState = applyMove(finalState, m, finalState.currentPlayer);
      }
      expect(() => getAIMove(finalState, "easy")).toThrow("No valid moves available");
    });
  });
});
