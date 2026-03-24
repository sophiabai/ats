import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface StarredRequisition {
  id: string
  title: string
}

interface StarredRequisitionsState {
  starred: StarredRequisition[]
  isStarred: (id: string) => boolean
  toggle: (req: StarredRequisition) => void
}

export const useStarredRequisitionsStore = create<StarredRequisitionsState>()(
  persist(
    (set, get) => ({
      starred: [],
      isStarred: (id) => get().starred.some((r) => r.id === id),
      toggle: (req) =>
        set((s) => {
          const exists = s.starred.some((r) => r.id === req.id)
          return {
            starred: exists
              ? s.starred.filter((r) => r.id !== req.id)
              : [...s.starred, req],
          }
        }),
    }),
    { name: "starred-requisitions" },
  ),
)
