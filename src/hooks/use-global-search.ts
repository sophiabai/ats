import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CandidateResult {
  id: string;
  first_name: string;
  last_name: string;
  headline: string | null;
  email: string | null;
  current_company: string | null;
}

interface RequisitionResult {
  id: string;
  req_number: number;
  title: string;
  department: string | null;
  location: string | null;
  status: string;
}

export interface SearchResults {
  candidates: CandidateResult[];
  requisitions: RequisitionResult[];
}

const MAX_SEARCH_LENGTH = 200;

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function useGlobalSearch(query: string) {
  const trimmed = query.slice(0, MAX_SEARCH_LENGTH);

  return useQuery({
    queryKey: ["global-search", trimmed],
    queryFn: async (): Promise<SearchResults> => {
      if (!trimmed || trimmed.length < 2)
        return { candidates: [], requisitions: [] };

      const escaped = escapeFilterValue(trimmed);

      const [candidateRes, reqRes] = await Promise.all([
        supabase
          .from("candidates")
          .select("id, first_name, last_name, headline, email, current_company")
          .or(
            `first_name.ilike."%${escaped}%",last_name.ilike."%${escaped}%",` +
              `headline.ilike."%${escaped}%",email.ilike."%${escaped}%",` +
              `current_company.ilike."%${escaped}%"`,
          )
          .limit(5),
        supabase
          .from("requisitions")
          .select("id, req_number, title, department, location, status")
          .or(`title.ilike."%${escaped}%",department.ilike."%${escaped}%"`)
          .limit(5),
      ]);

      return {
        candidates: candidateRes.data || [],
        requisitions: reqRes.data || [],
      };
    },
    enabled: trimmed.length >= 2,
    staleTime: 1000,
  });
}
