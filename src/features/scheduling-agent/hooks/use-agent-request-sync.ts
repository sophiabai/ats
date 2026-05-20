import { useMemo } from "react";
import { useSchedulingStateStore } from "@/features/scheduling-agent/stores/scheduling-state-store";

export function useAgentRequestSync() {
  const requestId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("request");
  }, []);

  const requests = useSchedulingStateStore((s) => s.requests);
  const updateRequest = useSchedulingStateStore((s) => s.updateRequest);

  const request = useMemo(
    () => (requestId ? requests.find((r) => r.id === requestId) : undefined),
    [requestId, requests],
  );

  function submitAvailability(slots: string[], note?: string) {
    if (!requestId) return;
    const body = note ? `${slots.join("\n")}\n\nNote: ${note}` : slots.join("\n");
    updateRequest(requestId, {
      candidate_reply: body,
      candidate_availability: slots,
      status: "replied",
    });
  }

  function submitPickedSlot(slot: string, note?: string) {
    if (!requestId) return;
    const body = note ? `I picked ${slot}.\n\nNote: ${note}` : `I picked ${slot}.`;
    updateRequest(requestId, {
      candidate_reply: body,
      candidate_picked_slot: slot,
      status: "replied",
    });
  }

  return { request, requestId, submitAvailability, submitPickedSlot };
}
