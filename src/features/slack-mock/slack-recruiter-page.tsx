import { RECRUITER_VIEWER, SlackPanel } from "@/features/slack-mock/slack-panel";

export function Component() {
  return <SlackPanel viewer={RECRUITER_VIEWER} />;
}
