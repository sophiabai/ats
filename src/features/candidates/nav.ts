import { Folder, Users } from "lucide-react";

import type { NavProjectsItem } from "@/components/nav-projects";
import { useCandidatePools } from "@/features/candidates/api/use-candidate-pools";

// Returns the candidates nav entry with each pool listed as a sub-item.
// Owned by the feature so the sidebar shell stays unaware of pool data.
export function useCandidatesNavItem(): NavProjectsItem {
  const { data: pools } = useCandidatePools();

  return {
    name: "Candidates",
    url: "#",
    icon: Users,
    items: [
      { title: "All candidates", url: "/candidates" },
      ...(pools ?? []).map((p) => ({
        title: p.name,
        url: `/candidates/pools/${p.id}`,
        icon: Folder,
      })),
    ],
  };
}
