"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { GameState, Move, Player } from "@/lib/game/types";

const PADDING = 32;
const MIN_CELL_SIZE = 48;
const DOT_RADIUS = 5;
const LINE_WIDTH = 4;
const HIT_LINE_WIDTH = 20;
const GHOST_OPACITY = 0.25;

interface BoardProps {
  state: GameState;
  onMove: (move: Move) => void;
  currentPlayer: Player;
  disabled?: boolean;
  className?: string;
  isThinking?: boolean;
}

interface EdgeData {
  type: "H" | "V";
  row: number;
  col: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
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
  id: string;
}

export function Board({ state, onMove, currentPlayer, disabled = false, className, isThinking = false }: BoardProps) {
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
        const x1 = PADDING + c * cellSize;
        const y1 = PADDING + r * cellSize;
        const x2 = PADDING + (c + 1) * cellSize;
        const y2 = PADDING + r * cellSize;
        edgesList.push({
          type: "H",
          row: r, col: c,
          x1, y1, x2, y2,
          cx: (x1 + x2) / 2,
          cy: (y1 + y2) / 2,
          claimed: state.horizontalEdges[r]?.[c] ?? false,
          id: `H-${r}-${c}`,
        });
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols + 1; c++) {
        const x1 = PADDING + c * cellSize;
        const y1 = PADDING + r * cellSize;
        const x2 = PADDING + c * cellSize;
        const y2 = PADDING + (r + 1) * cellSize;
        edgesList.push({
          type: "V",
          row: r, col: c,
          x1, y1, x2, y2,
          cx: (x1 + x2) / 2,
          cy: (y1 + y2) / 2,
          claimed: state.verticalEdges[r]?.[c] ?? false,
          id: `V-${r}-${c}`,
        });
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        boxesList.push({
          row: r, col: c,
          cx: PADDING + c * cellSize + cellSize / 2,
          cy: PADDING + r * cellSize + cellSize / 2,
          size: cellSize - 4,
          owner: state.boxes[r]?.[c] ?? 0,
          id: `box-${r}-${c}`,
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

  if (!state) return null;

  return (
    <div ref={boardRef} className={cn("select-none touch-none relative", className)}>
      <svg
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="w-full h-auto max-w-full"
        style={{ maxHeight: "min(80vh, 600px)" }}
        role="group"
        aria-label={`Dots and Boxes board, ${rows} by ${cols}`}
      >
        <defs>
          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="line-glow-p1">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="line-glow-p2">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="box-glow-p1">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="box-glow-p2">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x={PADDING - 8}
          y={PADDING - 8}
          width={cols * cellSize + 16}
          height={rows * cellSize + 16}
          rx={12}
          fill="none"
          stroke="var(--border)"
          strokeWidth={0.5}
          strokeDasharray="4 4"
          opacity={0.3}
        />

        {boxes.map((box) => {
          if (box.owner === 0) return null;
          const isP1 = box.owner === 1;
          const color = isP1 ? "var(--player1)" : "var(--player2)";
          const isNewlyPlaced = state.lastMove?.completedBoxes.some(
            ([br, bc]) => br === box.row && bc === box.col
          );
          return (
            <g key={box.id}>
              <rect
                x={box.cx - box.size / 2}
                y={box.cy - box.size / 2}
                width={box.size}
                height={box.size}
                rx={4}
                fill={color}
                fillOpacity={0.12}
                filter={`url(#box-glow-${isP1 ? "p1" : "p2"})`}
              />
              <motion.rect
                x={box.cx - box.size / 2}
                y={box.cy - box.size / 2}
                width={box.size}
                height={box.size}
                rx={4}
                initial={isNewlyPlaced ? { scale: 0, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring", stiffness: 250, damping: 18,
                }}
                style={{ fill: color, fillOpacity: 0.08 }}
                aria-label={`Box at row ${box.row + 1}, column ${box.col + 1}, owned by Player ${box.owner}`}
              />
              {isNewlyPlaced && (
                <>
                  <rect
                    x={box.cx - box.size / 2 - 2}
                    y={box.cy - box.size / 2 - 2}
                    width={box.size + 4}
                    height={box.size + 4}
                    rx={6}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.3}
                    filter={`url(#box-glow-${isP1 ? "p1" : "p2"})`}
                  >
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                  </rect>
                </>
              )}
            </g>
          );
        })}

        {edges.map((edge) => {
          const isHovered = hoveredEdge === edge.id;
          const isClaimed = edge.claimed;
          const isP1 = isClaimed && currentPlayer === 1;
          const isP2 = isClaimed && currentPlayer === 2;

          const edgeColor = isClaimed
            ? (currentPlayer === 1 ? "var(--player1)" : "var(--player2)")
            : isHovered && !disabled
            ? (currentPlayer === 1 ? "var(--player1)" : "var(--player2)")
            : "var(--border)";

          const glowFilter = isP1 ? "url(#line-glow-p1)" : isP2 ? "url(#line-glow-p2)" : undefined;

          return (
            <g key={edge.id}>
              {isClaimed && glowFilter && (
                <line
                  x1={edge.x1} y1={edge.y1}
                  x2={edge.x2} y2={edge.y2}
                  stroke={edgeColor}
                  strokeWidth={LINE_WIDTH + 4}
                  strokeLinecap="round"
                  opacity={0.2}
                  filter={glowFilter}
                />
              )}
              {!isClaimed && (
                <>
                  <line
                    x1={edge.x1} y1={edge.y1}
                    x2={edge.x2} y2={edge.y2}
                    stroke="transparent"
                    strokeWidth={HIT_LINE_WIDTH}
                    className={cn("cursor-pointer", disabled && "cursor-not-allowed")}
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
                    onFocus={() => !disabled && setHoveredEdge(edge.id)}
                    onBlur={() => setHoveredEdge(null)}
                  />
                </>
              )}
              {(isHovered || isClaimed) && (
                <motion.line
                  x1={edge.x1} y1={edge.y1}
                  x2={edge.x2} y2={edge.y2}
                  stroke={edgeColor}
                  strokeWidth={isHovered && !isClaimed ? LINE_WIDTH + 1 : LINE_WIDTH}
                  strokeLinecap="round"
                  initial={isClaimed ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ opacity: isClaimed ? 1 : GHOST_OPACITY }}
                  aria-hidden="true"
                />
              )}
              {isHovered && !isClaimed && !disabled && (
                <text
                  x={edge.cx}
                  y={edge.cy + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={edgeColor}
                  opacity={0.5}
                  aria-hidden="true"
                >
                  {edge.type === "H" ? "—" : "|"}
                </text>
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
              opacity={0.8}
              aria-hidden="true"
            />
          ))
        )}
      </svg>

      {isThinking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-live="polite" aria-label="AI is thinking">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl px-5 py-3 flex items-center gap-3 pointer-events-auto shadow-elevated"
          >
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-semibold text-foreground">AI thinking...</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
