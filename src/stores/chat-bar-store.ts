import { create } from "zustand"

interface ChatBarState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  docked: boolean
  setDocked: (docked: boolean) => void
  toggleDocked: () => void
}

export const useChatBarStore = create<ChatBarState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  docked: true,
  setDocked: (docked) => set({ docked }),
  toggleDocked: () => set((s) => ({ docked: !s.docked })),
}))
