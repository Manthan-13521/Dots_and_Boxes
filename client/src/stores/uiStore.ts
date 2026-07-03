import { create } from "zustand";

interface UIStore {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  colorBlindMode: boolean;
  highContrast: boolean;
  sfxVolume: number;
  musicVolume: number;

  toggleSound: () => void;
  toggleMusic: () => void;
  toggleAnimations: () => void;
  toggleColorBlind: () => void;
  toggleHighContrast: () => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  soundEnabled: true,
  musicEnabled: false,
  animationsEnabled: true,
  colorBlindMode: false,
  highContrast: false,
  sfxVolume: 0.7,
  musicVolume: 0.3,

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  toggleAnimations: () => set((s) => ({ animationsEnabled: !s.animationsEnabled })),
  toggleColorBlind: () => set((s) => ({ colorBlindMode: !s.colorBlindMode })),
  toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
  setSfxVolume: (sfxVolume) => set({ sfxVolume }),
  setMusicVolume: (musicVolume) => set({ musicVolume }),
}));
