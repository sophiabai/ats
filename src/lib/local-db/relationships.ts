// Foreign-key graph for the ATS schema, used to resolve PostgREST-style embedded
// resources (e.g. `candidates(*, applications(count))`) against the local store.
// Each entry means: <table>.<column> references <foreignTable>.<foreignColumn>.

interface ForeignKey {
  table: string;
  column: string;
  foreignTable: string;
  foreignColumn: string;
}

const FKS: ForeignKey[] = [
  { table: "applications", column: "candidate_id", foreignTable: "candidates", foreignColumn: "id" },
  { table: "applications", column: "req_id", foreignTable: "requisitions", foreignColumn: "id" },
  { table: "applications", column: "current_stage_id", foreignTable: "req_stages", foreignColumn: "id" },
  { table: "req_stages", column: "req_id", foreignTable: "requisitions", foreignColumn: "id" },
  { table: "req_interviews", column: "req_id", foreignTable: "requisitions", foreignColumn: "id" },
  { table: "req_interviews", column: "stage_id", foreignTable: "req_stages", foreignColumn: "id" },
  { table: "application_interviews", column: "application_id", foreignTable: "applications", foreignColumn: "id" },
  { table: "application_interviews", column: "stage_id", foreignTable: "req_stages", foreignColumn: "id" },
  { table: "application_interviews", column: "source_req_interview_id", foreignTable: "req_interviews", foreignColumn: "id" },
  { table: "scorecards", column: "application_interview_id", foreignTable: "application_interviews", foreignColumn: "id" },
  { table: "scorecards", column: "application_id", foreignTable: "applications", foreignColumn: "id" },
  { table: "stage_decisions", column: "application_id", foreignTable: "applications", foreignColumn: "id" },
  { table: "stage_decisions", column: "stage_id", foreignTable: "req_stages", foreignColumn: "id" },
  { table: "emails", column: "application_id", foreignTable: "applications", foreignColumn: "id" },
  { table: "emails", column: "candidate_id", foreignTable: "candidates", foreignColumn: "id" },
  { table: "hc_scenario_positions", column: "scenario_id", foreignTable: "hc_scenarios", foreignColumn: "id" },
  { table: "candidate_pool_members", column: "pool_id", foreignTable: "candidate_pools", foreignColumn: "id" },
  { table: "candidate_pool_members", column: "candidate_id", foreignTable: "candidates", foreignColumn: "id" },
  { table: "req_candidate_pools", column: "req_id", foreignTable: "requisitions", foreignColumn: "id" },
  { table: "req_candidate_pools", column: "pool_id", foreignTable: "candidate_pools", foreignColumn: "id" },
  { table: "candidate_activities", column: "candidate_id", foreignTable: "candidates", foreignColumn: "id" },
  { table: "candidate_activities", column: "application_id", foreignTable: "applications", foreignColumn: "id" },
  { table: "criteria_evaluations", column: "req_id", foreignTable: "requisitions", foreignColumn: "id" },
  { table: "criteria_evaluations", column: "candidate_id", foreignTable: "candidates", foreignColumn: "id" },
  { table: "requisitions", column: "intake_id", foreignTable: "intakes", foreignColumn: "id" },
];

export interface Relation {
  kind: "to-one" | "to-many";
  // A target row `t` belongs to parent row `p` when t[childKey] === p[parentKey].
  parentKey: string;
  childKey: string;
}

// Resolves how `target` embeds into `parent`. `hint` is the explicit FK column from
// PostgREST's `table!fk_column` syntax (needed when two tables share multiple FKs).
export function resolveRelation(
  parent: string,
  target: string,
  hint?: string,
): Relation | null {
  if (hint) {
    // Hint column lives on the parent -> parent points at target (to-one).
    const onParent = FKS.find(
      (f) => f.table === parent && f.column === hint && f.foreignTable === target,
    );
    if (onParent) {
      return { kind: "to-one", parentKey: onParent.column, childKey: onParent.foreignColumn };
    }
    // Hint column lives on the target -> many targets point back (to-many).
    const onChild = FKS.find(
      (f) => f.table === target && f.column === hint && f.foreignTable === parent,
    );
    if (onChild) {
      return { kind: "to-many", parentKey: onChild.foreignColumn, childKey: onChild.column };
    }
  }

  // Parent has an FK to target -> single related row.
  const toOne = FKS.find((f) => f.table === parent && f.foreignTable === target);
  if (toOne) return { kind: "to-one", parentKey: toOne.column, childKey: toOne.foreignColumn };

  // Target has an FK back to parent -> collection of related rows.
  const toMany = FKS.find((f) => f.table === target && f.foreignTable === parent);
  if (toMany) return { kind: "to-many", parentKey: toMany.foreignColumn, childKey: toMany.column };

  return null;
}
