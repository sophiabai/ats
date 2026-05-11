import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"

const HeaderActionsContext = createContext<HTMLDivElement | null>(null)

export function HeaderActionsProvider({
  children,
  value,
}: {
  children: ReactNode
  value: HTMLDivElement | null
}) {
  return (
    <HeaderActionsContext.Provider value={value}>
      {children}
    </HeaderActionsContext.Provider>
  )
}

export function useHeaderActionsRefCallback() {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  return [el, setEl] as const
}

/**
 * Renders its children into the layout header's actions slot via a portal.
 * No-op until the layout mounts the slot container.
 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const container = useContext(HeaderActionsContext)
  if (!container) return null
  return createPortal(children, container)
}
