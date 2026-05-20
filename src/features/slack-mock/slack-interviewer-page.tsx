import { useMemo } from "react";
import {
  INTERVIEWER_VIEWERS,
  SlackPanel,
} from "@/features/slack-mock/slack-panel";
import { useSchedulingStateStore } from "@/features/scheduling-agent";

export function Component() {
  const slackDMs = useSchedulingStateStore((s) => s.slackDMs);

  const viewer = useMemo(() => {
    const recentConflictDm = [...slackDMs]
      .filter((d) => d.type === "conflict_resolution" && !d.reply)
      .sort((a, b) => b.sent_at - a.sent_at)[0];

    if (recentConflictDm) {
      const match = INTERVIEWER_VIEWERS.find((v) => v.id === recentConflictDm.to_id);
      if (match) return match;
    }

    const recentDm = [...slackDMs]
      .filter((d) => d.to_role === "interviewer")
      .sort((a, b) => b.sent_at - a.sent_at)[0];
    if (recentDm) {
      const match = INTERVIEWER_VIEWERS.find((v) => v.id === recentDm.to_id);
      if (match) return match;
    }

    return INTERVIEWER_VIEWERS[0];
  }, [slackDMs]);

  return <SlackPanel viewer={viewer} />;
}
