import { create } from "zustand";

interface OrgChartDetailState {
  employeeId: string | null;
  open: (employeeId: string) => void;
  close: () => void;
  toggle: (employeeId: string) => void;
}

export const useOrgChartDetailStore = create<OrgChartDetailState>((set, get) => ({
  employeeId: null,
  open: (employeeId) => set({ employeeId }),
  close: () => set({ employeeId: null }),
  toggle: (employeeId) => {
    const s = get();
    set({ employeeId: s.employeeId === employeeId ? null : employeeId });
  },
}));
