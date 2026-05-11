import { create } from "zustand";

interface InboxDetailState {
  candidateId: string | null;
  appId: string | null;
  initialTab: string | null;
  open: (candidateId: string, appId: string, initialTab?: string) => void;
  close: () => void;
  toggle: (candidateId: string, appId: string, initialTab?: string) => void;
}

export const useInboxDetailStore = create<InboxDetailState>((set, get) => ({
  candidateId: null,
  appId: null,
  initialTab: null,
  open: (candidateId, appId, initialTab) =>
    set({ candidateId, appId, initialTab: initialTab ?? null }),
  close: () => set({ candidateId: null, appId: null, initialTab: null }),
  toggle: (candidateId, appId, initialTab) => {
    const s = get();
    if (s.appId === appId) {
      set({ candidateId: null, appId: null, initialTab: null });
    } else {
      set({ candidateId, appId, initialTab: initialTab ?? null });
    }
  },
}));
