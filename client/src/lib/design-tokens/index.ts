export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 24,
  7: 32,
  8: 48,
  9: 64,
  10: 96,
  11: 128,
} as const;

export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

export const colors = {
  light: {
    background: "#fafafa",
    foreground: "#171717",
    primary: "#3b82f6",
    "primary-light": "#60a5fa",
    "primary-dark": "#2563eb",
    secondary: "#8b5cf6",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    surface: "#ffffff",
    "surface-elevated": "#f5f5f5",
    border: "#e5e5e5",
    "border-light": "#f0f0f0",
    muted: "#737373",
    player1: "#3b82f6",
    player2: "#ef4444",
  },
  dark: {
    background: "#0a0a0a",
    foreground: "#f5f5f5",
    primary: "#60a5fa",
    "primary-light": "#93c5fd",
    "primary-dark": "#3b82f6",
    secondary: "#a78bfa",
    success: "#34d399",
    error: "#f87171",
    warning: "#fbbf24",
    surface: "#1a1a1a",
    "surface-elevated": "#262626",
    border: "#333333",
    "border-light": "#2a2a2a",
    muted: "#a3a3a3",
    player1: "#60a5fa",
    player2: "#f87171",
  },
} as const;

export const motion = {
  durations: {
    instant: 50,
    fast: 150,
    normal: 250,
    slow: 400,
    expressive: 600,
  } as const,
  easings: {
    default: [0.25, 0.1, 0.25, 1] as const,
    entrance: [0, 0.55, 0.45, 1] as const,
    exit: [0.55, 0, 1, 0.45] as const,
  },
  spring: {
    default: { type: "spring" as const, stiffness: 300, damping: 20, mass: 1 },
    snappy: { type: "spring" as const, stiffness: 500, damping: 30 },
    bouncy: { type: "spring" as const, stiffness: 200, damping: 8 },
    gentle: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
} as const;

export const typography = {
  fonts: {
    sans: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    mono: "var(--font-geist-mono), 'JetBrains Mono', monospace",
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
