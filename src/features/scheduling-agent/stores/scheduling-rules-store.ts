import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SchedulingRule {
  id: string;
  interviewer_id: string;
  interviewer_name: string;
  event_pattern: string;
  can_override: boolean;
  reason: string;
  created_at: number;
}

interface SchedulingRulesState {
  rules: SchedulingRule[];
  addRule: (rule: Omit<SchedulingRule, "id" | "created_at">) => SchedulingRule;
  findRules: (interviewer_id: string, event_pattern?: string) => SchedulingRule[];
  removeRule: (id: string) => void;
  resetRules: () => void;
}

function nextId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useSchedulingRulesStore = create<SchedulingRulesState>()(
  persist(
    (set, get) => ({
      rules: [],

      addRule: (rule) => {
        const newRule: SchedulingRule = {
          ...rule,
          id: nextId(),
          created_at: Date.now(),
        };
        set((s) => ({ rules: [...s.rules, newRule] }));
        return newRule;
      },

      findRules: (interviewer_id, event_pattern) => {
        const rules = get().rules.filter(
          (r) => r.interviewer_id === interviewer_id,
        );
        if (!event_pattern) return rules;
        const needle = event_pattern.toLowerCase();
        return rules.filter((r) =>
          r.event_pattern.toLowerCase().includes(needle) ||
          needle.includes(r.event_pattern.toLowerCase()),
        );
      },

      removeRule: (id) =>
        set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),

      resetRules: () => set({ rules: [] }),
    }),
    { name: "scheduling-rules" },
  ),
);
