import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(import.meta.dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabaseUrl = env["VITE_SUPABASE_URL"];
const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// --- Demo data ---

const candidates = [
  {
    first_name: "Alex",
    last_name: "Chen",
    email: "alex.chen@gmail.com",
    phone: "+1-415-555-0101",
    location: "San Francisco, CA",
    headline: "Senior Frontend Engineer",
    years_experience: 7,
    current_company: "Stripe",
    current_title: "Senior Software Engineer",
    work_history: [
      { company: "Stripe", title: "Senior Software Engineer", start_date: "2022-03", end_date: null, description: "Led frontend platform team" },
      { company: "Airbnb", title: "Software Engineer", start_date: "2019-06", end_date: "2022-02", description: "Built booking flow redesign" },
    ],
    education: [{ school: "UC Berkeley", degree: "BS", field: "Computer Science", start_year: 2014, end_year: 2018 }],
    skills: ["React", "TypeScript", "GraphQL", "Node.js", "Tailwind CSS"],
    tags: ["senior", "frontend"],
  },
  {
    first_name: "Maria",
    last_name: "Santos",
    email: "maria.santos@outlook.com",
    phone: "+1-212-555-0202",
    location: "New York, NY",
    headline: "Full Stack Developer",
    years_experience: 5,
    current_company: "Bloomberg",
    current_title: "Software Engineer II",
    work_history: [
      { company: "Bloomberg", title: "Software Engineer II", start_date: "2021-01", end_date: null, description: "Terminal web platform" },
      { company: "Capital One", title: "Software Engineer", start_date: "2019-07", end_date: "2020-12", description: "Customer-facing banking app" },
    ],
    education: [{ school: "Columbia University", degree: "MS", field: "Computer Science", start_year: 2017, end_year: 2019 }],
    skills: ["Python", "React", "PostgreSQL", "AWS", "Docker"],
    tags: ["mid-level", "fullstack"],
  },
  {
    first_name: "James",
    last_name: "Okafor",
    email: "james.okafor@proton.me",
    phone: "+1-512-555-0303",
    location: "Austin, TX",
    headline: "Backend Engineer & Systems Architect",
    years_experience: 10,
    current_company: "Oracle",
    current_title: "Principal Engineer",
    work_history: [
      { company: "Oracle", title: "Principal Engineer", start_date: "2020-08", end_date: null, description: "Cloud infrastructure team lead" },
      { company: "IBM", title: "Senior Engineer", start_date: "2016-03", end_date: "2020-07", description: "Distributed systems" },
    ],
    education: [{ school: "Georgia Tech", degree: "MS", field: "Computer Science", start_year: 2012, end_year: 2014 }],
    skills: ["Go", "Rust", "Kubernetes", "Terraform", "gRPC"],
    tags: ["senior", "backend", "infrastructure"],
  },
  {
    first_name: "Priya",
    last_name: "Sharma",
    email: "priya.sharma@yahoo.com",
    phone: "+1-206-555-0404",
    location: "Seattle, WA",
    headline: "Product Designer turned Frontend Engineer",
    years_experience: 4,
    current_company: "Amazon",
    current_title: "Frontend Engineer",
    work_history: [
      { company: "Amazon", title: "Frontend Engineer", start_date: "2023-01", end_date: null, description: "Alexa web experience" },
      { company: "Figma", title: "Design Engineer", start_date: "2021-06", end_date: "2022-12", description: "Built prototyping features" },
    ],
    education: [{ school: "University of Washington", degree: "BS", field: "Informatics", start_year: 2017, end_year: 2021 }],
    skills: ["React", "TypeScript", "Figma", "CSS", "Accessibility"],
    tags: ["mid-level", "frontend", "design"],
  },
  {
    first_name: "Liam",
    last_name: "Mueller",
    email: "liam.mueller@gmail.com",
    phone: "+1-303-555-0505",
    location: "Denver, CO",
    headline: "Machine Learning Engineer",
    years_experience: 6,
    current_company: "Databricks",
    current_title: "ML Engineer",
    work_history: [
      { company: "Databricks", title: "ML Engineer", start_date: "2022-05", end_date: null, description: "MLOps platform" },
      { company: "Palantir", title: "Data Scientist", start_date: "2019-08", end_date: "2022-04", description: "NLP and entity resolution" },
    ],
    education: [{ school: "Stanford University", degree: "MS", field: "Machine Learning", start_year: 2017, end_year: 2019 }],
    skills: ["Python", "PyTorch", "Spark", "SQL", "MLflow"],
    tags: ["senior", "ml", "data"],
  },
  {
    first_name: "Olivia",
    last_name: "Park",
    email: "olivia.park@gmail.com",
    phone: "+1-650-555-0606",
    location: "Palo Alto, CA",
    headline: "New grad — CS @ Stanford",
    years_experience: 0,
    current_company: null,
    current_title: "Student",
    work_history: [
      { company: "Google", title: "Software Engineering Intern", start_date: "2025-06", end_date: "2025-09", description: "Chrome team" },
    ],
    education: [{ school: "Stanford University", degree: "BS", field: "Computer Science", start_year: 2022, end_year: 2026 }],
    skills: ["Java", "Python", "React", "C++"],
    tags: ["new-grad", "intern"],
  },
  {
    first_name: "David",
    last_name: "Kim",
    email: "david.kim@hey.com",
    phone: "+1-310-555-0707",
    location: "Los Angeles, CA",
    headline: "Engineering Manager",
    years_experience: 12,
    current_company: "Snap",
    current_title: "Engineering Manager",
    work_history: [
      { company: "Snap", title: "Engineering Manager", start_date: "2021-04", end_date: null, description: "Camera platform, 8 reports" },
      { company: "Google", title: "Senior Software Engineer", start_date: "2016-01", end_date: "2021-03", description: "Android Camera" },
    ],
    education: [{ school: "MIT", degree: "BS", field: "EECS", start_year: 2010, end_year: 2014 }],
    skills: ["System Design", "People Management", "Java", "Kotlin", "C++"],
    tags: ["manager", "senior"],
  },
  {
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@gmail.com",
    phone: "+1-617-555-0808",
    location: "Boston, MA",
    headline: "DevOps / Platform Engineer",
    years_experience: 8,
    current_company: "HubSpot",
    current_title: "Staff Platform Engineer",
    work_history: [
      { company: "HubSpot", title: "Staff Platform Engineer", start_date: "2021-09", end_date: null, description: "Internal developer platform" },
      { company: "Datadog", title: "Site Reliability Engineer", start_date: "2018-02", end_date: "2021-08", description: "Observability infrastructure" },
    ],
    education: [{ school: "Northeastern University", degree: "BS", field: "Computer Engineering", start_year: 2013, end_year: 2017 }],
    skills: ["Kubernetes", "AWS", "Terraform", "Go", "Prometheus"],
    tags: ["senior", "platform", "devops"],
  },
];

const requisitions = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    employment_type: "full_time",
    recruiter_name: "Sophia R.",
    recruiter_email: "sophia@company.com",
    hiring_manager_name: "Tom Bradley",
    hiring_manager_email: "tom.b@company.com",
    status: "open",
    description: "We're looking for a senior frontend engineer to lead our web platform rebuild in React and TypeScript.",
    requirements: ["5+ years frontend experience", "Strong React and TypeScript", "Experience with design systems"],
    salary_min: 180000,
    salary_max: 240000,
    headcount: 2,
    opened_date: "2026-01-15T00:00:00Z",
  },
  {
    title: "Backend Engineer",
    department: "Engineering",
    location: "New York, NY",
    employment_type: "full_time",
    recruiter_name: "Sophia R.",
    recruiter_email: "sophia@company.com",
    hiring_manager_name: "Rachel Green",
    hiring_manager_email: "rachel.g@company.com",
    status: "open",
    description: "Backend engineer to build and scale our core API services.",
    requirements: ["3+ years backend experience", "Go or Python proficiency", "Experience with distributed systems"],
    salary_min: 160000,
    salary_max: 220000,
    headcount: 1,
    opened_date: "2026-02-01T00:00:00Z",
  },
  {
    title: "ML Engineer",
    department: "AI/ML",
    location: "Remote",
    employment_type: "full_time",
    recruiter_name: "Sophia R.",
    recruiter_email: "sophia@company.com",
    hiring_manager_name: "Dr. Yuki Tanaka",
    hiring_manager_email: "yuki.t@company.com",
    status: "open",
    description: "Build and deploy ML models for our recommendation and ranking systems.",
    requirements: ["MS in ML/AI or equivalent", "Production ML experience", "PyTorch or TensorFlow"],
    salary_min: 190000,
    salary_max: 260000,
    headcount: 1,
    opened_date: "2026-02-10T00:00:00Z",
  },
  {
    title: "Engineering Manager, Platform",
    department: "Engineering",
    location: "San Francisco, CA",
    employment_type: "full_time",
    recruiter_name: "Sophia R.",
    recruiter_email: "sophia@company.com",
    hiring_manager_name: "VP Engineering",
    hiring_manager_email: "vpe@company.com",
    status: "open",
    description: "Lead the platform engineering team responsible for CI/CD, infrastructure, and developer experience.",
    requirements: ["3+ years managing engineers", "Strong technical background", "Experience with cloud infrastructure"],
    salary_min: 220000,
    salary_max: 300000,
    headcount: 1,
    opened_date: "2026-01-20T00:00:00Z",
  },
  {
    title: "Software Engineering Intern",
    department: "Engineering",
    location: "San Francisco, CA",
    employment_type: "intern",
    recruiter_name: "Sophia R.",
    recruiter_email: "sophia@company.com",
    hiring_manager_name: "Tom Bradley",
    hiring_manager_email: "tom.b@company.com",
    status: "open",
    description: "Summer 2026 internship. Work on real features alongside the engineering team.",
    requirements: ["Currently pursuing CS degree", "Strong fundamentals"],
    salary_min: 65000,
    salary_max: 85000,
    headcount: 3,
    opened_date: "2026-02-20T00:00:00Z",
  },
  {
    title: "Staff Designer",
    department: "Design",
    location: "New York, NY",
    employment_type: "full_time",
    recruiter_name: "Sophia R.",
    recruiter_email: "sophia@company.com",
    hiring_manager_name: "Lisa Chang",
    hiring_manager_email: "lisa.c@company.com",
    status: "on_hold",
    description: "Staff product designer to own the design system and mentor junior designers.",
    requirements: ["8+ years product design", "Design systems experience", "Figma expertise"],
    salary_min: 190000,
    salary_max: 250000,
    headcount: 1,
    opened_date: "2025-12-01T00:00:00Z",
  },
  {
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    employment_type: "contract",
    recruiter_name: "Sophia R.",
    recruiter_email: "sophia@company.com",
    hiring_manager_name: "Sarah Chen",
    hiring_manager_email: "sarah.c@company.com",
    status: "closed",
    description: "6-month contract to help migrate to Kubernetes.",
    requirements: ["Kubernetes expert", "Terraform", "AWS or GCP"],
    salary_min: 150000,
    salary_max: 180000,
    headcount: 1,
    opened_date: "2025-10-15T00:00:00Z",
    closed_date: "2026-01-30T00:00:00Z",
  },
];

const DEFAULT_STAGES = [
  { milestone: "screen", name: "Recruiter Screen", sort_order: 1 },
  { milestone: "screen", name: "Hiring Manager Screen", sort_order: 2 },
  { milestone: "final_interview", name: "Onsite Interview", sort_order: 1 },
  { milestone: "final_interview", name: "Reference Check", sort_order: 2 },
] as const;

const DEFAULT_INTERVIEWS: Record<string, Array<{ title: string; interview_type: string; order_position: number | null }>> = {
  "Recruiter Screen": [{ title: "Recruiter Screen", interview_type: "standard", order_position: 1 }],
  "Hiring Manager Screen": [{ title: "Hiring Manager Screen", interview_type: "standard", order_position: 1 }],
  "Onsite Interview": [
    { title: "System Design", interview_type: "technical", order_position: null },
    { title: "Coding Interview", interview_type: "technical", order_position: null },
    { title: "Behavioral", interview_type: "behavioral", order_position: null },
  ],
  "Reference Check": [{ title: "Reference Check", interview_type: "reference_check", order_position: 1 }],
};

// Which candidates apply to which reqs (by index), with source and milestone progress
const applicationMap: Array<{
  candidateIdx: number;
  reqIdx: number;
  source: string;
  milestone: string;
  status: string;
}> = [
  { candidateIdx: 0, reqIdx: 0, source: "linkedin", milestone: "final_interview", status: "active" },
  { candidateIdx: 1, reqIdx: 0, source: "careers_page", milestone: "screen", status: "active" },
  { candidateIdx: 3, reqIdx: 0, source: "referral", milestone: "screen", status: "active" },
  { candidateIdx: 1, reqIdx: 1, source: "linkedin", milestone: "application", status: "active" },
  { candidateIdx: 2, reqIdx: 1, source: "referral", milestone: "final_interview", status: "active" },
  { candidateIdx: 4, reqIdx: 2, source: "linkedin", milestone: "offer", status: "active" },
  { candidateIdx: 6, reqIdx: 3, source: "referral", milestone: "screen", status: "active" },
  { candidateIdx: 7, reqIdx: 3, source: "careers_page", milestone: "application", status: "active" },
  { candidateIdx: 5, reqIdx: 4, source: "university", milestone: "screen", status: "active" },
  { candidateIdx: 7, reqIdx: 6, source: "agency", milestone: "offer_accepted", status: "hired" },
];

async function seed() {
  console.log("Seeding demo data...\n");

  // 1. Insert candidates
  console.log("  Inserting candidates...");
  const { data: insertedCandidates, error: candErr } = await supabase
    .from("candidates")
    .insert(candidates)
    .select();
  if (candErr) throw candErr;
  console.log(`  ✓ ${insertedCandidates.length} candidates`);

  // 2. Insert requisitions
  console.log("  Inserting requisitions...");
  const { data: insertedReqs, error: reqErr } = await supabase
    .from("requisitions")
    .insert(requisitions)
    .select();
  if (reqErr) throw reqErr;
  console.log(`  ✓ ${insertedReqs.length} requisitions`);

  // 3. Insert stages for each req
  console.log("  Inserting stages...");
  const allStages = insertedReqs.flatMap((req) =>
    DEFAULT_STAGES.map((s) => ({ req_id: req.id, ...s }))
  );
  const { data: insertedStages, error: stageErr } = await supabase
    .from("req_stages")
    .insert(allStages)
    .select();
  if (stageErr) throw stageErr;
  console.log(`  ✓ ${insertedStages.length} stages`);

  // 4. Insert interviews for each stage
  console.log("  Inserting req interviews...");
  const allInterviews = insertedStages.flatMap((stage) => {
    const defaults = DEFAULT_INTERVIEWS[stage.name] ?? [];
    return defaults.map((i) => ({
      req_id: stage.req_id,
      stage_id: stage.id,
      ...i,
      duration_minutes: 60,
    }));
  });
  const { data: insertedInterviews, error: intErr } = await supabase
    .from("req_interviews")
    .insert(allInterviews)
    .select();
  if (intErr) throw intErr;
  console.log(`  ✓ ${insertedInterviews.length} req interviews`);

  // 5. Insert applications
  console.log("  Inserting applications...");
  const appRows = applicationMap.map((a) => ({
    candidate_id: insertedCandidates[a.candidateIdx].id,
    req_id: insertedReqs[a.reqIdx].id,
    source: a.source,
    current_milestone: a.milestone,
    status: a.status,
  }));
  const { data: insertedApps, error: appErr } = await supabase
    .from("applications")
    .insert(appRows)
    .select();
  if (appErr) throw appErr;
  console.log(`  ✓ ${insertedApps.length} applications`);

  // 6. Copy req interviews → application interviews for each application
  console.log("  Inserting application interviews...");
  const appInterviewRows = insertedApps.flatMap((app) => {
    const reqInterviewsForReq = insertedInterviews.filter(
      (ri) => ri.req_id === app.req_id
    );
    return reqInterviewsForReq.map((ri) => ({
      application_id: app.id,
      stage_id: ri.stage_id,
      source_req_interview_id: ri.id,
      title: ri.title,
      interview_type: ri.interview_type,
      duration_minutes: ri.duration_minutes,
      order_position: ri.order_position,
      status: "pending" as const,
    }));
  });
  const { data: insertedAppInterviews, error: aiErr } = await supabase
    .from("application_interviews")
    .insert(appInterviewRows)
    .select();
  if (aiErr) throw aiErr;
  console.log(`  ✓ ${insertedAppInterviews.length} application interviews`);

  console.log("\n✓ Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
