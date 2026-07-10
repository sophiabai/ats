import { create } from "zustand";

interface ScenarioPanelState {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

export const useScenarioPanelStore = create<ScenarioPanelState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));
