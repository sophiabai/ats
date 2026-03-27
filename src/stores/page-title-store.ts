import { useEffect } from "react";
import { create } from "zustand";

interface PageTitleState {
  pageTitle: string | null;
  setPageTitle: (title: string | null) => void;
}

export const usePageTitleStore = create<PageTitleState>((set) => ({
  pageTitle: null,
  setPageTitle: (title) => set({ pageTitle: title }),
}));

export function useSetPageTitle(title: string | null | undefined) {
  const setPageTitle = usePageTitleStore((s) => s.setPageTitle);

  useEffect(() => {
    if (title) setPageTitle(title);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);
}
