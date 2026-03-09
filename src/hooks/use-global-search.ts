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
  title: string;
  department: string | null;
  location: string | null;
  status: string;
}

export interface SearchResults {
  candidates: CandidateResult[];
  requisitions: RequisitionResult[];
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: async (): Promise<SearchResults> => {
      if (!query || query.length < 2)
        return { candidates: [], requisitions: [] };

      const [candidateRes, reqRes] = await Promise.all([
        supabase
          .from("candidates")
          .select("id, first_name, last_name, headline, email, current_company")
          .or(
            `first_name.ilike.%${query}%,last_name.ilike.%${query}%,` +
              `headline.ilike.%${query}%,email.ilike.%${query}%,` +
              `current_company.ilike.%${query}%`,
          )
          .limit(5),
        supabase
          .from("requisitions")
          .select("id, title, department, location, status")
          .or(`title.ilike.%${query}%,department.ilike.%${query}%`)
          .limit(5),
      ]);

      return {
        candidates: candidateRes.data || [],
        requisitions: reqRes.data || [],
      };
    },
    enabled: query.length >= 2,
    staleTime: 1000,
  });
}
