import { Briefcase } from "lucide-react";

import type { NavProjectsItem } from "@/components/nav-projects";
import { formatReqTitle } from "@/lib/utils";
import { useStarredRequisitionsStore } from "@/stores/starred-requisitions-store";

// Returns the requisitions nav entry, expanding starred reqs as a sub-list
// when present. Owned by the feature so the sidebar shell stays unaware of
// requisition data.
export function useRequisitionsNavItem(): NavProjectsItem {
  const starred = useStarredRequisitionsStore((s) => s.starred);

  const item: NavProjectsItem = {
    name: "Job requisitions",
    url: "/requisitions",
    icon: Briefcase,
  };

  if (starred.length > 0) {
    item.items = [
      { title: "All requisitions", url: "/requisitions" },
      ...starred.map((r) => ({
        title: formatReqTitle(r.req_number, r.title),
        url: `/requisitions/${r.id}`,
      })),
    ];
  }

  return item;
}
