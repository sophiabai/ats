import type {
  Employee,
  EmploymentStatus,
  EmploymentType,
  Level,
  SalaryPeriod,
} from "./types";

type EmployeeSeed = Pick<
  Employee,
  "id" | "parentId" | "name" | "title" | "department" | "imageUrl"
>;

// Real avatar pictures shipped under /public/avatars. There are 45 of them, so
// for the 100-person org we cycle through this list deterministically based on
// each employee's seed (slugified name) — same employee always gets the same
// picture across the org chart, profile panel, and anywhere else imageUrl is
// rendered.
const AVATAR_FILES = [
  "Avatar pic 01.png",
  "Avatar pic 02.png",
  "Avatar pic 03.png",
  "Avatar pic 04.png",
  "Avatar pic 05.png",
  "Avatar pic 06.png",
  "Avatar pic 07.png",
  "Avatar pic 08.png",
  "Avatar pic 09.png",
  "Avatar pic 10.png",
  "Avatar pic 11.png",
  "Avatar pic 12.png",
  "Avatar pic 13.png",
  "Avatar pic 14.png",
  "Avatar pic 15.png",
  "Avatar pic 16.png",
  "Avatar pic 17.jpg",
  "Avatar pic 18.png",
  "Avatar pic 19.png",
  "Avatar pic 20.png",
  "Avatar pic 21.png",
  "Avatar pic 22.png",
  "Avatar pic 23.png",
  "Avatar pic 24.png",
  "Avatar pic 25.png",
  "Avatar pic 26.png",
  "Avatar pic 27.png",
  "Avatar pic 28.png",
  "Avatar pic 29.png",
  "Avatar pic 30.png",
  "Avatar pic 31.png",
  "Avatar pic 32.png",
  "Avatar pic 33.png",
  "Avatar pic 34.png",
  "Avatar pic 35.png",
  "Avatar pic 36.png",
  "Avatar pic 37.png",
  "Avatar pic 38.png",
  "Avatar pic 39.png",
  "Avatar pic 40.png",
  "Avatar pic 41.png",
  "Avatar pic 42.png",
  "Avatar pic 43.png",
  "Avatar pic 44.png",
  "Avatar pic 45.png",
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function avatar(seed: string) {
  const file = AVATAR_FILES[hashSeed(seed) % AVATAR_FILES.length];
  return `/avatars/${encodeURIComponent(file)}`;
}

const EMPLOYEE_SEED: EmployeeSeed[] = [
  // ── CEO ───────────────────────────────────────────────
  { id: "1", parentId: "", name: "Jordan Chen", title: "CEO", department: "Executive", imageUrl: avatar("jordan-chen") },

  // ── C-Suite ───────────────────────────────────────────
  { id: "2", parentId: "1", name: "Priya Patel", title: "CTO", department: "Engineering", imageUrl: avatar("priya-patel") },
  { id: "3", parentId: "1", name: "Marcus Johnson", title: "CPO", department: "Product", imageUrl: avatar("marcus-johnson") },
  { id: "4", parentId: "1", name: "Sarah Kim", title: "VP Sales", department: "Sales", imageUrl: avatar("sarah-kim") },
  { id: "5", parentId: "1", name: "David Okafor", title: "VP Marketing", department: "Marketing", imageUrl: avatar("david-okafor") },
  { id: "6", parentId: "1", name: "Rachel Torres", title: "VP Customer Success", department: "Customer Success", imageUrl: avatar("rachel-torres") },
  { id: "7", parentId: "1", name: "Michael Zhang", title: "CFO", department: "Finance", imageUrl: avatar("michael-zhang") },
  { id: "8", parentId: "1", name: "Lisa Nakamura", title: "COO", department: "Operations", imageUrl: avatar("lisa-nakamura") },

  // ── Engineering (reports to CTO #2) ───────────────────
  { id: "9", parentId: "2", name: "Alex Rivera", title: "VP Engineering", department: "Engineering", imageUrl: avatar("alex-rivera") },

  // Frontend
  { id: "10", parentId: "9", name: "Emily Watson", title: "Frontend Lead", department: "Engineering", imageUrl: avatar("emily-watson") },
  { id: "11", parentId: "10", name: "Liam Park", title: "Sr. Frontend Engineer", department: "Engineering", imageUrl: avatar("liam-park") },
  { id: "12", parentId: "10", name: "Sophia Andersen", title: "Frontend Engineer", department: "Engineering", imageUrl: avatar("sophia-andersen") },
  { id: "13", parentId: "10", name: "Noah Garcia", title: "Frontend Engineer", department: "Engineering", imageUrl: avatar("noah-garcia") },
  { id: "14", parentId: "10", name: "Ava Nguyen", title: "Frontend Engineer", department: "Engineering", imageUrl: avatar("ava-nguyen") },
  { id: "15", parentId: "10", name: "Ethan Brown", title: "Frontend Engineer", department: "Engineering", imageUrl: avatar("ethan-brown") },
  { id: "16", parentId: "10", name: "Mia Thompson", title: "Frontend Engineer", department: "Engineering", imageUrl: avatar("mia-thompson") },

  // Backend
  { id: "17", parentId: "9", name: "James Liu", title: "Backend Lead", department: "Engineering", imageUrl: avatar("james-liu") },
  { id: "18", parentId: "17", name: "Isabella Martinez", title: "Sr. Backend Engineer", department: "Engineering", imageUrl: avatar("isabella-martinez") },
  { id: "19", parentId: "17", name: "Benjamin Taylor", title: "Backend Engineer", department: "Engineering", imageUrl: avatar("benjamin-taylor") },
  { id: "20", parentId: "17", name: "Charlotte Wilson", title: "Backend Engineer", department: "Engineering", imageUrl: avatar("charlotte-wilson") },
  { id: "21", parentId: "17", name: "Lucas Harris", title: "Backend Engineer", department: "Engineering", imageUrl: avatar("lucas-harris") },
  { id: "22", parentId: "17", name: "Amelia Clark", title: "Backend Engineer", department: "Engineering", imageUrl: avatar("amelia-clark") },

  // DevOps / Infrastructure
  { id: "23", parentId: "9", name: "Samuel Patel", title: "Infrastructure Lead", department: "Engineering", imageUrl: avatar("samuel-patel") },
  { id: "24", parentId: "23", name: "Harper Lee", title: "DevOps Engineer", department: "Engineering", imageUrl: avatar("harper-lee") },
  { id: "25", parentId: "23", name: "Daniel Scott", title: "DevOps Engineer", department: "Engineering", imageUrl: avatar("daniel-scott") },
  { id: "26", parentId: "23", name: "Ella Robinson", title: "SRE", department: "Engineering", imageUrl: avatar("ella-robinson") },

  // Mobile
  { id: "27", parentId: "9", name: "Christopher Yang", title: "Mobile Lead", department: "Engineering", imageUrl: avatar("christopher-yang") },
  { id: "28", parentId: "27", name: "Grace Walker", title: "iOS Engineer", department: "Engineering", imageUrl: avatar("grace-walker") },
  { id: "29", parentId: "27", name: "Jack Hall", title: "Android Engineer", department: "Engineering", imageUrl: avatar("jack-hall") },
  { id: "30", parentId: "27", name: "Lily Allen", title: "Mobile Engineer", department: "Engineering", imageUrl: avatar("lily-allen") },

  // QA
  { id: "31", parentId: "9", name: "Nina Kowalski", title: "QA Lead", department: "Engineering", imageUrl: avatar("nina-kowalski") },
  { id: "32", parentId: "31", name: "Oscar Young", title: "QA Engineer", department: "Engineering", imageUrl: avatar("oscar-young") },
  { id: "33", parentId: "31", name: "Zoe King", title: "QA Engineer", department: "Engineering", imageUrl: avatar("zoe-king") },
  { id: "34", parentId: "31", name: "Ryan Wright", title: "QA Engineer", department: "Engineering", imageUrl: avatar("ryan-wright") },

  // Data Engineering
  { id: "35", parentId: "9", name: "Omar Hassan", title: "Data Engineering Lead", department: "Engineering", imageUrl: avatar("omar-hassan") },
  { id: "36", parentId: "35", name: "Chloe Lopez", title: "Data Engineer", department: "Engineering", imageUrl: avatar("chloe-lopez") },
  { id: "37", parentId: "35", name: "Mason Green", title: "Data Engineer", department: "Engineering", imageUrl: avatar("mason-green") },

  // ── Product (reports to CPO #3) ───────────────────────
  { id: "38", parentId: "3", name: "Diana Lee", title: "Head of Product", department: "Product", imageUrl: avatar("diana-lee") },
  { id: "39", parentId: "38", name: "Henry Adams", title: "Sr. Product Manager", department: "Product", imageUrl: avatar("henry-adams") },
  { id: "40", parentId: "38", name: "Aria Nelson", title: "Product Manager", department: "Product", imageUrl: avatar("aria-nelson") },
  { id: "41", parentId: "38", name: "Leo Carter", title: "Product Manager", department: "Product", imageUrl: avatar("leo-carter") },
  { id: "42", parentId: "38", name: "Stella Mitchell", title: "Product Analyst", department: "Product", imageUrl: avatar("stella-mitchell") },

  // Design (reports to CPO — design lives under Product as a sub-department)
  { id: "43", parentId: "3", name: "Tyler Brooks", title: "Head of Design", department: "Product", imageUrl: avatar("tyler-brooks") },
  { id: "44", parentId: "43", name: "Penelope Perez", title: "Sr. Product Designer", department: "Product", imageUrl: avatar("penelope-perez") },
  { id: "45", parentId: "43", name: "Sebastian Roberts", title: "Product Designer", department: "Product", imageUrl: avatar("sebastian-roberts") },
  { id: "46", parentId: "43", name: "Layla Turner", title: "Product Designer", department: "Product", imageUrl: avatar("layla-turner") },
  { id: "47", parentId: "43", name: "Nolan Phillips", title: "UX Researcher", department: "Product", imageUrl: avatar("nolan-phillips") },

  // ── Sales (reports to VP Sales #4) ────────────────────
  // Enterprise
  { id: "48", parentId: "4", name: "Robert Chen", title: "Director, Enterprise Sales", department: "Sales", imageUrl: avatar("robert-chen") },
  { id: "49", parentId: "48", name: "Vivian Campbell", title: "Sr. Account Executive", department: "Sales", imageUrl: avatar("vivian-campbell") },
  { id: "50", parentId: "48", name: "Nathan Parker", title: "Account Executive", department: "Sales", imageUrl: avatar("nathan-parker") },
  { id: "51", parentId: "48", name: "Hazel Edwards", title: "Account Executive", department: "Sales", imageUrl: avatar("hazel-edwards") },
  { id: "52", parentId: "48", name: "Adrian Collins", title: "Account Executive", department: "Sales", imageUrl: avatar("adrian-collins") },

  // SMB
  { id: "53", parentId: "4", name: "Michelle Park", title: "Director, SMB Sales", department: "Sales", imageUrl: avatar("michelle-park") },
  { id: "54", parentId: "53", name: "Eli Stewart", title: "SDR", department: "Sales", imageUrl: avatar("eli-stewart") },
  { id: "55", parentId: "53", name: "Aurora Sanchez", title: "SDR", department: "Sales", imageUrl: avatar("aurora-sanchez") },
  { id: "56", parentId: "53", name: "Caleb Morris", title: "SDR", department: "Sales", imageUrl: avatar("caleb-morris") },
  { id: "57", parentId: "53", name: "Isla Rogers", title: "SDR", department: "Sales", imageUrl: avatar("isla-rogers") },

  // Solutions Engineering
  { id: "58", parentId: "4", name: "Kevin O'Brien", title: "Solutions Engineering Lead", department: "Sales", imageUrl: avatar("kevin-obrien") },
  { id: "59", parentId: "58", name: "Ruby Reed", title: "Solutions Engineer", department: "Sales", imageUrl: avatar("ruby-reed") },
  { id: "60", parentId: "58", name: "Axel Cook", title: "Solutions Engineer", department: "Sales", imageUrl: avatar("axel-cook") },

  // ── Marketing (reports to VP Marketing #5) ────────────
  { id: "61", parentId: "5", name: "Amanda Silva", title: "Content Lead", department: "Marketing", imageUrl: avatar("amanda-silva") },
  { id: "62", parentId: "61", name: "Jasper Bailey", title: "Content Marketer", department: "Marketing", imageUrl: avatar("jasper-bailey") },
  { id: "63", parentId: "61", name: "Willow Cooper", title: "Content Marketer", department: "Marketing", imageUrl: avatar("willow-cooper") },

  { id: "64", parentId: "5", name: "Brian Murphy", title: "Growth Lead", department: "Marketing", imageUrl: avatar("brian-murphy") },
  { id: "65", parentId: "64", name: "Luna Richardson", title: "Growth Marketer", department: "Marketing", imageUrl: avatar("luna-richardson") },
  { id: "66", parentId: "64", name: "Miles Cox", title: "Growth Marketer", department: "Marketing", imageUrl: avatar("miles-cox") },

  { id: "67", parentId: "5", name: "Jessica Huang", title: "Brand Lead", department: "Marketing", imageUrl: avatar("jessica-huang") },
  { id: "68", parentId: "67", name: "Sienna Ward", title: "Brand Designer", department: "Marketing", imageUrl: avatar("sienna-ward") },

  { id: "69", parentId: "5", name: "Derek James", title: "Events Manager", department: "Marketing", imageUrl: avatar("derek-james") },

  // ── Customer Success (reports to VP CS #6) ────────────
  { id: "70", parentId: "6", name: "Daniel Green", title: "CS Team Lead", department: "Customer Success", imageUrl: avatar("daniel-green") },
  { id: "71", parentId: "70", name: "Piper Howard", title: "Sr. CSM", department: "Customer Success", imageUrl: avatar("piper-howard") },
  { id: "72", parentId: "70", name: "Theo Morgan", title: "CSM", department: "Customer Success", imageUrl: avatar("theo-morgan") },
  { id: "73", parentId: "70", name: "Ivy Bell", title: "CSM", department: "Customer Success", imageUrl: avatar("ivy-bell") },
  { id: "74", parentId: "70", name: "Xavier Murphy", title: "CSM", department: "Customer Success", imageUrl: avatar("xavier-murphy") },
  { id: "75", parentId: "70", name: "Daisy Foster", title: "CSM", department: "Customer Success", imageUrl: avatar("daisy-foster") },

  { id: "76", parentId: "6", name: "Ashley Williams", title: "Support Lead", department: "Customer Success", imageUrl: avatar("ashley-williams") },
  { id: "77", parentId: "76", name: "Roman Gray", title: "Support Engineer", department: "Customer Success", imageUrl: avatar("roman-gray") },
  { id: "78", parentId: "76", name: "Ellie James", title: "Support Engineer", department: "Customer Success", imageUrl: avatar("ellie-james") },
  { id: "79", parentId: "76", name: "Finn Russell", title: "Support Engineer", department: "Customer Success", imageUrl: avatar("finn-russell") },
  { id: "80", parentId: "76", name: "Scarlett Price", title: "Support Engineer", department: "Customer Success", imageUrl: avatar("scarlett-price") },

  // ── Finance (reports to CFO #7) ───────────────────────
  { id: "81", parentId: "7", name: "Thomas Wright", title: "Finance Director", department: "Finance", imageUrl: avatar("thomas-wright") },
  { id: "82", parentId: "81", name: "Naomi Bennett", title: "Financial Analyst", department: "Finance", imageUrl: avatar("naomi-bennett") },
  { id: "83", parentId: "81", name: "Kai Wood", title: "Financial Analyst", department: "Finance", imageUrl: avatar("kai-wood") },

  { id: "84", parentId: "7", name: "Catherine Barnes", title: "Accounting Manager", department: "Finance", imageUrl: avatar("catherine-barnes") },
  { id: "85", parentId: "84", name: "Dylan Ross", title: "Accountant", department: "Finance", imageUrl: avatar("dylan-ross") },

  // ── Operations (reports to COO #8) ────────────────────
  { id: "86", parentId: "8", name: "Jennifer Adams", title: "HR Director", department: "Operations", imageUrl: avatar("jennifer-adams") },
  { id: "87", parentId: "86", name: "Audrey Henderson", title: "HR Manager", department: "Operations", imageUrl: avatar("audrey-henderson") },
  { id: "88", parentId: "86", name: "Levi Coleman", title: "Recruiter", department: "Operations", imageUrl: avatar("levi-coleman") },
  { id: "89", parentId: "86", name: "Clara Jenkins", title: "Recruiter", department: "Operations", imageUrl: avatar("clara-jenkins") },
  { id: "90", parentId: "86", name: "Owen Perry", title: "Recruiter", department: "Operations", imageUrl: avatar("owen-perry") },

  { id: "91", parentId: "8", name: "Carlos Mendez", title: "IT Manager", department: "Operations", imageUrl: avatar("carlos-mendez") },
  { id: "92", parentId: "91", name: "Violet Powell", title: "IT Support Specialist", department: "Operations", imageUrl: avatar("violet-powell") },
  { id: "93", parentId: "91", name: "Jace Long", title: "IT Support Specialist", department: "Operations", imageUrl: avatar("jace-long") },

  { id: "94", parentId: "8", name: "Patricia Sullivan", title: "Legal Counsel", department: "Operations", imageUrl: avatar("patricia-sullivan") },
  { id: "95", parentId: "8", name: "George Butler", title: "Office Manager", department: "Operations", imageUrl: avatar("george-butler") },

  // ── Additional hires to reach 100 ────────────────────
  { id: "96", parentId: "10", name: "Mateo Flores", title: "Frontend Engineer", department: "Engineering", imageUrl: avatar("mateo-flores") },
  { id: "97", parentId: "17", name: "Freya Simmons", title: "Backend Engineer", department: "Engineering", imageUrl: avatar("freya-simmons") },
  { id: "98", parentId: "38", name: "Hugo Foster", title: "Associate PM", department: "Product", imageUrl: avatar("hugo-foster") },
  { id: "99", parentId: "53", name: "Eliana Bryant", title: "SDR", department: "Sales", imageUrl: avatar("eliana-bryant") },
  { id: "100", parentId: "70", name: "Beckett Hayes", title: "CSM", department: "Customer Success", imageUrl: avatar("beckett-hayes") },
];

// ─────────────────────────────────────────────────────────
// Extended HR data
// ─────────────────────────────────────────────────────────
//
// The seed above only contains the fields needed to render the org chart. The
// full Employee record (used by the HR view + filter dialog) is generated
// deterministically from the seed below — same employee always gets the same
// values. Generation is hash-based so we don't drift if the seed grows.

interface CountryProfile {
  name: string;
  regions: string[];
  legalEntity: string;
  currency: string;
}

const COUNTRY_PROFILES: CountryProfile[] = [
  {
    name: "United States",
    regions: ["California", "New York", "Texas", "Washington", "Massachusetts"],
    legalEntity: "Smith LLC-862103462",
    currency: "USD",
  },
  {
    name: "Canada",
    regions: ["Ontario", "British Columbia", "Quebec"],
    legalEntity: "Smith Canada Inc.",
    currency: "CAD",
  },
  {
    name: "United Kingdom",
    regions: ["London", "Manchester"],
    legalEntity: "Smith UK Ltd.",
    currency: "GBP",
  },
  {
    name: "India",
    regions: ["Bangalore", "Mumbai", "Delhi"],
    legalEntity: "ABC India Inc.",
    currency: "INR",
  },
];

// Country distribution weights (must sum to 100). US-heavy + a few remote.
const COUNTRY_WEIGHTS: Array<{ country: string; weight: number }> = [
  { country: "United States", weight: 60 },
  { country: "Canada", weight: 12 },
  { country: "United Kingdom", weight: 10 },
  { country: "India", weight: 10 },
  { country: "All Remote Employees", weight: 8 },
];

const TEAMS = [
  "Operations",
  "Events",
  "Support",
  "Softball Team",
  "team_1",
  "team_2",
];

const EMPLOYMENT_STATUS_WEIGHTS: Array<{
  status: EmploymentStatus;
  weight: number;
}> = [
  { status: "Active", weight: 80 },
  { status: "Hired", weight: 6 },
  { status: "Accepted", weight: 4 },
  { status: "Requested Hires", weight: 4 },
  { status: "Terminated", weight: 6 },
];

const EMPLOYMENT_TYPE_WEIGHTS: Array<{
  type: EmploymentType;
  weight: number;
}> = [
  { type: "Salaried, full-time", weight: 65 },
  { type: "Salaried, part-time", weight: 8 },
  { type: "Hourly, full-time", weight: 8 },
  { type: "Hourly, part-time", weight: 4 },
  { type: "Contractor", weight: 6 },
  { type: "Contractor / 1099", weight: 4 },
  { type: "Intern", weight: 3 },
  { type: "Full time", weight: 2 },
];

function pickWeighted<T>(
  hash: number,
  options: Array<{ weight: number; value: T }>
): T {
  const total = options.reduce((acc, o) => acc + o.weight, 0);
  let pick = hash % total;
  for (const opt of options) {
    if (pick < opt.weight) return opt.value;
    pick -= opt.weight;
  }
  return options[0].value;
}

function deriveSubDepartment(seed: EmployeeSeed): string {
  const t = seed.title.toLowerCase();
  const dept = seed.department;

  // Engineering specializations
  if (dept === "Engineering") {
    if (t.includes("frontend")) return "Frontend";
    if (t.includes("backend")) return "Backend";
    if (
      t.includes("ios") ||
      t.includes("android") ||
      t.includes("mobile")
    )
      return "Mobile";
    if (
      t.includes("devops") ||
      t.includes("sre") ||
      t.includes("infrastructure")
    )
      return "Infrastructure";
    if (t.includes("qa")) return "QA";
    if (t.includes("data eng")) return "Data";
    return "Engineering";
  }

  // Product splits between PM track and design track
  if (dept === "Product") {
    if (
      t.includes("designer") ||
      t.includes("ux") ||
      t.includes("design")
    )
      return "Product Design";
    return "Product";
  }

  // Sales splits across enterprise / SMB / solutions
  if (dept === "Sales") {
    if (t.includes("enterprise") || t.includes("account exec"))
      return "Enterprise";
    if (t.includes("sdr") || t.includes("smb")) return "SMB";
    if (t.includes("solutions")) return "Solutions Engineering";
    return "Sales";
  }

  // Marketing
  if (dept === "Marketing") {
    if (t.includes("content")) return "Content";
    if (t.includes("growth")) return "Growth";
    if (t.includes("brand")) return "Brand";
    if (t.includes("event")) return "Events";
    return "Marketing";
  }

  // Customer Success
  if (dept === "Customer Success") {
    if (t.includes("support")) return "Customer Support";
    return "Customer Success";
  }

  // Finance
  if (dept === "Finance") {
    if (t.includes("accountant") || t.includes("accounting"))
      return "Accounting";
    return "Finance";
  }

  // Operations
  if (dept === "Operations") {
    if (t.includes("recruit")) return "Recruiting";
    if (t.includes("hr ") || t === "hr director" || t === "hr manager")
      return "People";
    if (t.includes("it ") || t === "it manager") return "IT";
    if (t.includes("legal")) return "Legal";
    if (t.includes("office")) return "Workplace";
    return "Operations";
  }

  return dept;
}

function deriveJobFamily(e: EmployeeSeed): string {
  const t = e.title.toLowerCase();
  if (t.includes("frontend")) return "Frontend";
  if (t.includes("backend")) return "Backend";
  if (
    t.includes("ios") ||
    t.includes("android") ||
    t.includes("mobile")
  )
    return "Mobile";
  if (
    t.includes("devops") ||
    t.includes("sre") ||
    t.includes("infrastructure")
  )
    return "Infrastructure";
  if (t.includes("data eng")) return "Data";
  if (t.includes("qa")) return "QA";
  if (t.includes("solutions")) return "Solutions";
  if (t.includes("enterprise")) return "Enterprise";
  if (t.includes("sdr") || t.includes("smb")) return "SMB";
  if (t.includes("account exec")) return "Enterprise";
  if (t.includes("content")) return "Content";
  if (t.includes("growth")) return "Growth";
  if (t.includes("brand")) return "Brand";
  if (t.includes("event")) return "Events";
  if (t.includes("csm") || t.includes("cs ")) return "Customer Success";
  if (t.includes("support")) return "Customer Support";
  if (t.includes("recruit")) return "Recruiting";
  if (t.includes("hr ")) return "Human Resources";
  if (t.includes("it ")) return "Information Technology";
  if (t.includes("legal")) return "Legal";
  if (t.includes("office")) return "Operations";
  if (t.includes("accountant") || t.includes("accounting"))
    return "Accounting";
  if (t.includes("financial") || t.includes("finance")) return "Finance";
  if (t.includes("designer") || t.includes("ux")) return "Design";
  if (t.includes("product")) return "Product";
  return e.department;
}

function deriveLevel(e: EmployeeSeed): Level {
  const t = e.title.toLowerCase();
  if (
    t === "ceo" ||
    t === "cto" ||
    t === "cfo" ||
    t === "coo" ||
    t === "cpo"
  )
    return "C Level";
  if (t.startsWith("vp")) return "VP";
  if (t.includes("director") || t.includes("head of")) return "Management-7";
  if (t.includes("lead") || t.includes("manager")) return "Management-6";
  if (t.includes("sr.") || t.startsWith("sr ")) return "Individual Contributor-7";
  if (t.includes("associate") || t.includes("intern"))
    return "Individual Contributor-3";
  return "Individual Contributor-5";
}

function deriveCountry(hash: number): string {
  return pickWeighted(
    hash,
    COUNTRY_WEIGHTS.map((c) => ({ weight: c.weight, value: c.country }))
  );
}

function profileForCountry(country: string): CountryProfile | null {
  return COUNTRY_PROFILES.find((c) => c.name === country) ?? null;
}

function deriveRegion(country: string, hash: number): string {
  if (country === "All Remote Employees") return "Remote";
  const profile = profileForCountry(country);
  if (!profile) return "";
  return profile.regions[hash % profile.regions.length];
}

function deriveLegalEntity(country: string, hash: number): string {
  if (country === "All Remote Employees") {
    // Remote workers spread across all entities
    return COUNTRY_PROFILES[hash % COUNTRY_PROFILES.length].legalEntity;
  }
  const profile = profileForCountry(country);
  return profile?.legalEntity ?? "Smith LLC-862103462";
}

function deriveCurrency(country: string): string {
  if (country === "All Remote Employees") return "USD";
  const profile = profileForCountry(country);
  return profile?.currency ?? "USD";
}

function deriveEmploymentStatus(
  e: EmployeeSeed,
  hash: number
): EmploymentStatus {
  // CEO and direct reports are always Active to keep the chart sensible.
  if (e.id === "1" || e.parentId === "1") return "Active";
  return pickWeighted(
    hash,
    EMPLOYMENT_STATUS_WEIGHTS.map((s) => ({
      weight: s.weight,
      value: s.status,
    }))
  );
}

function deriveEmploymentType(
  level: Level,
  hash: number
): EmploymentType {
  if (level === "C Level" || level === "VP") return "Salaried, full-time";
  return pickWeighted(
    hash,
    EMPLOYMENT_TYPE_WEIGHTS.map((t) => ({ weight: t.weight, value: t.type }))
  );
}

function deriveStartDate(hash: number): string {
  // Spread between 2015-01-01 and 2025-06-01.
  const start = new Date("2015-01-01").getTime();
  const end = new Date("2025-06-01").getTime();
  const ts = start + (hash % (end - start));
  return new Date(ts).toISOString().slice(0, 10);
}

function deriveEndDate(
  status: EmploymentStatus,
  startDate: string,
  hash: number
): string | null {
  if (status !== "Terminated") return null;
  const start = new Date(startDate).getTime();
  const end = new Date("2025-12-01").getTime();
  if (end <= start) return null;
  const ts = start + (hash % (end - start));
  return new Date(ts).toISOString().slice(0, 10);
}

function deriveSalary(
  level: Level,
  employmentType: EmploymentType,
  currency: string,
  hash: number
): { amount: number; period: SalaryPeriod } {
  const isHourly =
    employmentType.startsWith("Hourly") || employmentType === "Intern";

  const baseRanges: Record<Level, [number, number]> = {
    "C Level": [300_000, 450_000],
    VP: [220_000, 320_000],
    "Management-7": [160_000, 230_000],
    "Management-6": [130_000, 190_000],
    "Individual Contributor-7": [130_000, 180_000],
    "Individual Contributor-6": [110_000, 150_000],
    "Individual Contributor-5": [80_000, 120_000],
    "Individual Contributor-3": [50_000, 80_000],
  };

  const [lo, hi] = baseRanges[level];
  let yearly = lo + (hash % (hi - lo));

  // Convert from USD baseline to local currency (rough static rates).
  const rate =
    currency === "CAD"
      ? 1.36
      : currency === "GBP"
        ? 0.79
        : currency === "INR"
          ? 83
          : 1;
  yearly = Math.round(yearly * rate);

  if (isHourly) {
    const hourly = Math.round(yearly / 2080 / 5) * 5; // round to nearest 5
    return { amount: hourly, period: "per hour" };
  }
  // Snap salaried numbers to nearest 1k for nicer display.
  yearly = Math.round(yearly / 1000) * 1000;
  return { amount: yearly, period: "per year" };
}

function deriveTeam(e: EmployeeSeed, hash: number): string {
  if (e.department === "Marketing" && e.title.includes("Event"))
    return "Events";
  if (e.department === "Customer Success") return "Support";
  if (e.department === "Operations") return "Operations";
  return TEAMS[hash % TEAMS.length];
}

function enrichEmployee(seed: EmployeeSeed): Employee {
  const h = hashSeed(seed.name);
  const country = deriveCountry(h);
  const region = deriveRegion(country, h >>> 3);
  const legalEntity = deriveLegalEntity(country, h >>> 5);
  const currency = deriveCurrency(country);
  const level = deriveLevel(seed);
  const employmentType = deriveEmploymentType(level, h >>> 7);
  const employmentStatus = deriveEmploymentStatus(seed, h >>> 9);
  const startDate = deriveStartDate(h >>> 11);
  const endDate = deriveEndDate(employmentStatus, startDate, h >>> 13);
  const { amount: salaryAmount, period: salaryPeriod } = deriveSalary(
    level,
    employmentType,
    currency,
    h >>> 15
  );

  return {
    ...seed,
    subDepartment: deriveSubDepartment(seed),
    jobFamily: deriveJobFamily(seed),
    team: deriveTeam(seed, h >>> 17),
    level,
    country,
    region,
    employmentStatus,
    employmentType,
    legalEntity,
    startDate,
    endDate,
    salaryAmount,
    salaryCurrency: currency,
    salaryPeriod,
    hasBonus:
      level === "C Level" ||
      level === "VP" ||
      level === "Management-7" ||
      seed.department === "Sales",
    hasCommission: seed.department === "Sales",
  };
}

export const employees: Employee[] = EMPLOYEE_SEED.map(enrichEmployee);

// ─────────────────────────────────────────────────────────
// Lookup helpers used by the filter dialog
// ─────────────────────────────────────────────────────────

export const ALL_LEVELS: Level[] = [
  "C Level",
  "VP",
  "Management-7",
  "Management-6",
  "Individual Contributor-7",
  "Individual Contributor-6",
  "Individual Contributor-5",
  "Individual Contributor-3",
];

export const ALL_EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  "Hired",
  "Accepted",
  "Active",
  "Terminated",
  "Requested Hires",
];

export const ALL_EMPLOYMENT_TYPES: EmploymentType[] = [
  "Contractor",
  "Contractor / 1099",
  "Full time",
  "Hourly, full-time",
  "Hourly, part-time",
  "Intern",
  "Salaried, full-time",
  "Salaried, part-time",
];

function uniqueSorted<T extends string>(values: Iterable<T>): T[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export const ALL_JOB_FAMILIES: string[] = uniqueSorted(
  employees.map((e) => e.jobFamily)
);

export const ALL_TEAMS: string[] = uniqueSorted(employees.map((e) => e.team));

export const ALL_LEGAL_ENTITIES: string[] = uniqueSorted(
  employees.map((e) => e.legalEntity)
);

export interface CountryGroup {
  name: string;
  regions: string[];
}

export const ALL_COUNTRY_GROUPS: CountryGroup[] = (() => {
  const map = new Map<string, Set<string>>();
  for (const e of employees) {
    if (!map.has(e.country)) map.set(e.country, new Set());
    if (e.region) map.get(e.country)!.add(e.region);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, regions]) => ({
      name,
      regions: [...regions].sort((a, b) => a.localeCompare(b)),
    }));
})();

export const ALL_DEPARTMENTS: string[] = uniqueSorted(
  employees.map((e) => e.department)
);

export const DEPARTMENT_COLORS: Record<string, string> = {
  Executive: "#7A005D",
  Engineering: "#2563eb",
  Product: "#7c3aed",
  Sales: "#059669",
  Marketing: "#d97706",
  "Customer Success": "#0891b2",
  Finance: "#4f46e5",
  Operations: "#64748b",
};

export interface DepartmentGroup {
  name: string;
  subDepartments: string[];
}

export const ALL_DEPARTMENT_GROUPS: DepartmentGroup[] = (() => {
  const map = new Map<string, Set<string>>();
  for (const e of employees) {
    if (!map.has(e.department)) map.set(e.department, new Set());
    map.get(e.department)!.add(e.subDepartment);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, subs]) => ({
      name,
      subDepartments: [...subs].sort((a, b) => a.localeCompare(b)),
    }));
})();
