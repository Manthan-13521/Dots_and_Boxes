"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { GameState, Move, Player } from "@/lib/game/types";

const PADDING = 32;
const MIN_CELL_SIZE = 48;
const DOT_RADIUS = 4;
const LINE_WIDTH = 3;
const HIT_LINE_WIDTH = 20;
const GHOST_OPACITY = 0.3;

interface BoardProps {
  state: GameState;
  onMove: (move: Move) => void;
  currentPlayer: Player;
  disabled?: boolean;
  className?: string;
}

interface EdgeData {
  type: "H" | "V";
  row: number;
  col: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  claimed: boolean;
  id: string;
}

interface BoxData {
  row: number;
  col: number;
  cx: number;
  cy: number;
  size: number;
  owner: Player | 0;
}

export function Board({ state, onMove, currentPlayer, disabled = false, className }: BoardProps) {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const { rows, cols } = state.config;
  const cellSize = MIN_CELL_SIZE;
  const boardWidth = cols * cellSize + PADDING * 2;
  const boardHeight = rows * cellSize + PADDING * 2;

  const { edges, boxes } = useMemo(() => {
    const edgesList: EdgeData[] = [];
    const boxesList: BoxData[] = [];

    for (let r = 0; r < rows + 1; r++) {
      for (let c = 0; c < cols; c++) {
        edgesList.push({
          type: "H",
          row: r,
          col: c,
          x1: PADDING + c * cellSize,
          y1: PADDING + r * cellSize,
          x2: PADDING + (c + 1) * cellSize,
          y2: PADDING + r * cellSize,
          claimed: state.horizontalEdges[r]?.[c] ?? false,
          id: `H-${r}-${c}`,
        });
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols + 1; c++) {
        edgesList.push({
          type: "V",
          row: r,
          col: c,
          x1: PADDING + c * cellSize,
          y1: PADDING + r * cellSize,
          x2: PADDING + c * cellSize,
          y2: PADDING + (r + 1) * cellSize,
          claimed: state.verticalEdges[r]?.[c] ?? false,
          id: `V-${r}-${c}`,
        });
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        boxesList.push({
          row: r,
          col: c,
          cx: PADDING + c * cellSize + cellSize / 2,
          cy: PADDING + r * cellSize + cellSize / 2,
          size: cellSize - 4,
          owner: state.boxes[r]?.[c] ?? 0,
        });
      }
    }

    return { edges: edgesList, boxes: boxesList };
  }, [state, rows, cols, cellSize]);

  const handleEdgeClick = useCallback(
    (edge: EdgeData) => {
      if (disabled || edge.claimed) return;
      if (state.status !== "playing") return;
      onMove({ type: edge.type, row: edge.row, col: edge.col });
    },
    [disabled, state.status, onMove]
  );

  const getEdgeColor = useCallback(
    (edge: EdgeData, isHovered: boolean) => {
      if (edge.claimed) {
        return currentPlayer === 1 ? "var(--player1)" : "var(--player2)";
      }
      if (isHovered && !disabled) {
        return currentPlayer === 1 ? "var(--player1)" : "var(--player2)";
      }
      return "var(--border)";
    },
    [currentPlayer, disabled]
  );

  if (!state) return null;

  return (
    <div ref={boardRef} className={cn("select-none touch-none", className)}>
      <svg
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="w-full h-auto max-w-full"
        style={{ maxHeight: "min(80vh, 600px)" }}
        role="group"
        aria-label={`Dots and Boxes board, ${rows} by ${cols}`}
      >
        <defs>
          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {boxes.map((box) => {
          if (box.owner === 0) return null;
          const color = box.owner === 1 ? "var(--player1)" : "var(--player2)";
          const isNewlyPlaced = state.lastMove?.completedBoxes.some(
            ([br, bc]) => br === box.row && bc === box.col
          );
          return (
            <motion.rect
              key={`box-${box.row}-${box.col}`}
              x={box.cx - box.size / 2}
              y={box.cy - box.size / 2}
              width={box.size}
              height={box.size}
              rx={3}
              initial={isNewlyPlaced ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ fill: color, fillOpacity: 0.15 }}
              aria-label={`Box at row ${box.row + 1}, column ${box.col + 1}, owned by Player ${box.owner}`}
            />
          );
        })}

        {edges.map((edge) => {
          const isHovered = hoveredEdge === edge.id;
          const isClaimed = edge.claimed;
          const color = getEdgeColor(edge, isHovered);

          return (
            <g key={edge.id}>
              {!isClaimed && (
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="transparent"
                  strokeWidth={HIT_LINE_WIDTH}
                  className={cn(
                    "cursor-pointer",
                    disabled && "cursor-not-allowed"
                  )}
                  onClick={() => handleEdgeClick(edge)}
                  onPointerEnter={() => !disabled && setHoveredEdge(edge.id)}
                  onPointerLeave={() => setHoveredEdge(null)}
                  role="button"
                  aria-label={`Place ${edge.type === "H" ? "horizontal" : "vertical"} line at row ${edge.row + 1}, column ${edge.col + 1}`}
                  aria-disabled={disabled || isClaimed}
                  tabIndex={disabled || isClaimed ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleEdgeClick(edge);
                    }
                  }}
                />
              )}
              {(isHovered || isClaimed) && (
                <motion.line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={color}
                  strokeWidth={LINE_WIDTH}
                  strokeLinecap="round"
                  initial={isClaimed ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    opacity: isClaimed ? 1 : GHOST_OPACITY,
                  }}
                  aria-hidden="true"
                />
              )}
            </g>
          );
        })}

        {Array.from({ length: rows + 1 }, (_, r) =>
          Array.from({ length: cols + 1 }, (_, c) => (
            <circle
              key={`dot-${r}-${c}`}
              cx={PADDING + c * cellSize}
              cy={PADDING + r * cellSize}
              r={DOT_RADIUS}
              fill="var(--foreground)"
              filter="url(#dot-glow)"
              aria-hidden="true"
            />
          ))
        )}
      </svg>
    </div>
  );
}
