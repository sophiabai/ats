import { create } from "zustand"

interface ChatBarState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useChatBarStore = create<ChatBarState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
