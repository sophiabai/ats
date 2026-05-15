import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import OpenAI from "openai";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { marked } from "marked";
import {
  Briefcase,
  CalendarClock,
  FileText,
  ListChecks,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { StepNav } from "@/components/custom/step-nav";
import {
  InterviewPlanCardList,
  type InterviewPlanSession,
} from "@/features/candidates/components/scheduling/interview-plan-card";
import { API_ENDPOINTS, DEFAULT_MODEL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/custom/rich-text-editor";
import { useCreateRequisition } from "@/features/requisitions/api/use-create-requisition";
import { useLinkPoolsToReq } from "@/features/requisitions/api/use-req-candidate-pools";
import { useCandidatePools } from "@/features/candidates/api/use-candidate-pools";

interface CreateRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormState>;
  autoGenerate?: boolean;
  onCreated?: (id: string) => void;
}

const DEPARTMENTS = [
  "Any department",
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Customer Success",
  "AI Research",
];

const STEPS = [
  { label: "Basic info", subtitle: "Role & hiring team", icon: Briefcase },
  { label: "Job description", subtitle: "Write or generate with AI", icon: FileText },
  { label: "Assessment criteria", subtitle: "Evaluation criteria", icon: ListChecks },
  { label: "Candidate pools", subtitle: "Link sourcing pools", icon: Users },
  { label: "Interview plan", subtitle: "Default loop sessions", icon: CalendarClock },
] as const;

const DEFAULT_INTERVIEW_PLAN: InterviewPlanSession[] = [
  {
    title: "Phone screen",
    startHour: 9,
    durationMinutes: 30,
    room: "SF-15-Bruce(6) [Zoom]",
    participants: [],
  },
  {
    title: "Hiring manager",
    startHour: 9,
    durationMinutes: 45,
    room: "SF-15-Bruce(6) [Zoom]",
    participants: [],
  },
  {
    title: "Technical",
    startHour: 9,
    durationMinutes: 60,
    room: "SF-15-Bruce(6) [Zoom]",
    participants: [],
  },
];

export interface FormState {
  title: string;
  department: string;
  employment_type: string;
  level: string;
  hiring_manager_name: string;
  recruiter_name: string;
  include_coordinator: boolean;
  coordinator_name: string;
  include_sourcer: boolean;
  sourcer_name: string;
  description: string;
  assessment_criteria: string[];
  linked_pool_ids: string[];
  interview_plan: InterviewPlanSession[];
  intake_id: string | null;
}

const INITIAL_FORM: FormState = {
  title: "",
  department: "Any department",
  employment_type: "full_time",
  level: "",
  hiring_manager_name: "",
  recruiter_name: "",
  include_coordinator: false,
  coordinator_name: "",
  include_sourcer: false,
  sourcer_name: "",
  description: "",
  assessment_criteria: [],
  linked_pool_ids: [],
  interview_plan: [],
  intake_id: null,
};

async function aiGenerateViaApi(prompt: string): Promise<string> {
  const res = await apiClient<{ content: string }>(API_ENDPOINTS.aiGenerate, {
    method: "POST",
    body: { prompt },
  });
  return res.content;
}

async function aiGenerateDirect(prompt: string): Promise<string> {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content ?? "";
}

const aiGenerate = import.meta.env.DEV ? aiGenerateDirect : aiGenerateViaApi;


export function CreateRequisitionDialog({
  open,
  onOpenChange,
  initialData,
  autoGenerate,
  onCreated,
}: CreateRequisitionDialogProps) {
  const createReq = useCreateRequisition();
  const linkPoolsMutation = useLinkPoolsToReq();
  const isEditing = !!initialData?.title && !autoGenerate;
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>({
    ...INITIAL_FORM,
    ...initialData,
  });

  const pendingAutoGenerate = React.useRef(false);

  React.useEffect(() => {
    if (open && initialData) {
      setForm({ ...INITIAL_FORM, ...initialData });
      if (autoGenerate && initialData.title) {
        setStep(2);
        pendingAutoGenerate.current = true;
      } else {
        setStep(1);
      }
    }
  }, [open, initialData, autoGenerate]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setForm({ ...INITIAL_FORM, ...initialData });
    setStep(1);
  }

  const generateDescription = useMutation({
    mutationFn: async () => {
      const prompt = `You are an expert technical recruiter. Write a professional job description in markdown for the following role.

Title: ${form.title}
Department: ${form.department}
Level: ${form.level || "Not specified"}
Employment type: ${form.employment_type.replace("_", " ")}

Use this exact structure with markdown headings:

## About the role
(2-3 paragraphs about what this role does and why it matters)

## Responsibilities
(bulleted list, 5-8 items, each starting with -)

## Requirements
(bulleted list, 5-8 items, each starting with -)

## Nice to have
(bulleted list, 3-5 items, each starting with -)

Do not include the job title as a heading. Write only the markdown content.`;

      const md = await aiGenerate(prompt);
      return marked.parse(md) as string;
    },
    onSuccess: (html) => {
      updateField("description", html);
      if (pendingAutoCriteria.current) {
        setStep(3);
      }
    },
  });

  const pendingAutoCriteria = React.useRef(false);

  React.useEffect(() => {
    if (pendingAutoGenerate.current && step === 2 && !form.description) {
      pendingAutoGenerate.current = false;
      pendingAutoCriteria.current = !!autoGenerate;
      generateDescription.mutate();
    }
  }, [step]);

  const generateCriteria = useMutation({
    mutationFn: async () => {
      const prompt = `You are an expert recruiter. Based on this job description, generate 5-8 assessment criteria that interviewers should evaluate candidates on. Each criterion should be a concise phrase (3-8 words).

Job title: ${form.title}
Department: ${form.department}

Job description:
${form.description}

Return ONLY a valid JSON array of strings, no other text. Example: ["Technical depth in React", "System design skills", "Communication clarity"]`;

      const raw = await aiGenerate(prompt);
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Invalid AI response");
      return JSON.parse(match[0]) as string[];
    },
    onSuccess: (criteria) => {
      updateField("assessment_criteria", criteria);
    },
  });

  React.useEffect(() => {
    if (
      pendingAutoCriteria.current &&
      step === 3 &&
      form.assessment_criteria.length === 0
    ) {
      pendingAutoCriteria.current = false;
      generateCriteria.mutate();
    }
  }, [step]);

  async function handleSubmit() {
    const result = await createReq.mutateAsync({
      title: form.title,
      department: form.department,
      employment_type: form.employment_type,
      level: form.level,
      hiring_manager_name: form.hiring_manager_name,
      recruiter_name: form.recruiter_name,
      coordinator_name: form.include_coordinator ? form.coordinator_name : "",
      sourcer_name: form.include_sourcer ? form.sourcer_name : "",
      description: form.description,
      assessment_criteria: form.assessment_criteria.filter(Boolean),
      intake_id: form.intake_id,
    });
    if (form.linked_pool_ids.length > 0) {
      await linkPoolsMutation.mutateAsync({
        reqId: result.id,
        poolIds: form.linked_pool_ids,
      });
    }
    reset();
    onOpenChange(false);
    onCreated?.(result.id);
  }

  function canAdvance(): boolean {
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return true;
    return true;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-4xl p-0 gap-0" showCloseButton={false}>
        <div className="flex h-[75vh]">
          <div className="flex flex-col border-r bg-muted/30 p-5">
            <DialogHeader className="mb-4 pl-3">
              <DialogTitle className="text-base">{isEditing ? "Edit requisition" : "New requisition"}</DialogTitle>
              <DialogDescription className="sr-only">
                Step {step} of {STEPS.length}
              </DialogDescription>
            </DialogHeader>
            <StepNav
              steps={STEPS}
              current={step - 1}
              onStepClick={(i) => setStep(i + 1)}
              className="w-52"
            />
          </div>

          <div className="flex flex-1 flex-col">
            <div className={cn("flex-1 overflow-y-auto p-10", step === 2 && "flex flex-col overflow-hidden")}>
              {step === 1 && <Step1 form={form} updateField={updateField} />}
              {step === 2 && (
                <Step2
                  form={form}
                  updateField={updateField}
                  generateDescription={generateDescription}
                />
              )}
              {step === 3 && (
                <Step3
                  form={form}
                  updateField={updateField}
                  generateCriteria={generateCriteria}
                />
              )}
              {step === 4 && (
                <Step4 form={form} updateField={updateField} />
              )}
              {step === 5 && (
                <Step5 form={form} updateField={updateField} />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              )}
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              {step < STEPS.length ? (
                <Button
                  type="button"
                  disabled={!canAdvance()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={createReq.isPending || linkPoolsMutation.isPending || !canAdvance()}
                  onClick={handleSubmit}
                >
                  {createReq.isPending
                    ? isEditing ? "Saving..." : "Creating..."
                    : isEditing ? "Save" : "Create requisition"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Step1({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Define the role basics and assign your hiring team. This information
        will be used to generate the job description and assessment criteria.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="req-title">Job title</Label>
          <Input
            id="req-title"
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="req-level">Level</Label>
          <Input
            id="req-level"
            value={form.level}
            onChange={(e) => updateField("level", e.target.value)}
            
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Department</Label>
          <Select
            value={form.department}
            onValueChange={(v) => updateField("department", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Employment type</Label>
          <Select
            value={form.employment_type}
            onValueChange={(v) => updateField("employment_type", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full-time</SelectItem>
              <SelectItem value="part_time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="req-hm">Hiring manager</Label>
          <Input
            id="req-hm"
            value={form.hiring_manager_name}
            onChange={(e) => updateField("hiring_manager_name", e.target.value)}
            
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="req-recruiter">Recruiter</Label>
          <Input
            id="req-recruiter"
            value={form.recruiter_name}
            onChange={(e) => updateField("recruiter_name", e.target.value)}
            
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Additional hiring team members</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="req-coordinator"
              checked={form.include_coordinator}
              onCheckedChange={(v) => updateField("include_coordinator", v)}
            />
            <Label htmlFor="req-coordinator" className="font-normal">
              Coordinator
            </Label>
          </div>
          {form.include_coordinator && (
            <Input
              className="w-48"
              value={form.coordinator_name}
              onChange={(e) => updateField("coordinator_name", e.target.value)}
              
            />
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="req-sourcer"
              checked={form.include_sourcer}
              onCheckedChange={(v) => updateField("include_sourcer", v)}
            />
            <Label htmlFor="req-sourcer" className="font-normal">
              Sourcer
            </Label>
          </div>
          {form.include_sourcer && (
            <Input
              className="w-48"
              value={form.sourcer_name}
              onChange={(e) => updateField("sourcer_name", e.target.value)}
              
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Step2({
  form,
  updateField,
  generateDescription,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  generateDescription: ReturnType<typeof useMutation<string, Error, void>>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="shrink-0 text-sm text-muted-foreground">
        Write a job description or generate one with AI based on the role
        details from the previous step.
      </p>
      <RichTextEditor
        className="min-h-0 flex-1"
        content={form.description}
        onChange={(html) => updateField("description", html)}
        placeholder="Write or generate a job description..."
      />
      {generateDescription.isError && (
        <p className="shrink-0 text-sm text-destructive">
          Failed to generate: {generateDescription.error.message}
        </p>
      )}
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto w-fit shrink-0 gap-1.5 px-0"
        disabled={generateDescription.isPending || !form.title}
        onClick={() => generateDescription.mutate()}
      >
        {generateDescription.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {generateDescription.isPending ? "Generating..." : "Generate with AI"}
      </Button>
    </div>
  );
}

function Step3({
  form,
  updateField,
  generateCriteria,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  generateCriteria: ReturnType<typeof useMutation<string[], Error, void>>;
}) {
  const criteria = form.assessment_criteria;

  React.useEffect(() => {
    if (criteria.length === 0 && !generateCriteria.isPending) {
      updateField("assessment_criteria", [""]);
    }
  }, [criteria.length, generateCriteria.isPending]);

  function updateCriterion(index: number, value: string) {
    const next = [...criteria];
    next[index] = value;
    updateField("assessment_criteria", next);
  }

  function removeCriterion(index: number) {
    updateField(
      "assessment_criteria",
      criteria.filter((_, i) => i !== index),
    );
  }

  function addCriterion() {
    updateField("assessment_criteria", [...criteria, ""]);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Add criteria that interviewers will use to evaluate candidates. Generate
        them from your job description or add your own.
      </p>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto w-fit gap-1.5 px-0"
        disabled={generateCriteria.isPending || !form.description}
        onClick={() => generateCriteria.mutate()}
      >
        {generateCriteria.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {generateCriteria.isPending ? "Generating..." : "Generate with AI"}
      </Button>

      {generateCriteria.isPending && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Generating criteria from job description...
        </div>
      )}

      {criteria.length > 0 && (
        <div className="space-y-2">
          {criteria.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
                {i + 1}
              </span>
              <Input
                value={c}
                onChange={(e) => updateCriterion(i, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeCriterion(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto w-fit gap-1.5 px-0"
        onClick={addCriterion}
      >
        <Plus className="size-3.5" />
        Add criterion
      </Button>

      {generateCriteria.isError && (
        <p className="text-sm text-destructive">
          Failed to generate: {generateCriteria.error.message}
        </p>
      )}
    </div>
  );
}

function Step4({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}) {
  const { data: pools, isLoading } = useCandidatePools();
  const selected = new Set(form.linked_pool_ids);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateField("linked_pool_ids", Array.from(next));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading pools...
      </div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-muted-foreground">
        <Users className="size-8" />
        <p className="text-sm">No candidate pools available</p>
        <p className="text-xs">Create pools from the candidate pools page first.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Select candidate pools to link to this requisition. Candidates in linked
        pools will be automatically evaluated against your assessment criteria.
      </p>
      <div className="space-y-1">
        {pools.map((pool) => (
          <label
            key={pool.id}
            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted/50"
          >
            <Checkbox
              checked={selected.has(pool.id)}
              onCheckedChange={() => toggle(pool.id)}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{pool.name}</div>
              <div className="text-xs text-muted-foreground">
                {pool.member_count} candidate
                {pool.member_count !== 1 ? "s" : ""}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function Step5({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}) {
  const plan = form.interview_plan ?? [];

  React.useEffect(() => {
    if (plan.length === 0) {
      updateField("interview_plan", DEFAULT_INTERVIEW_PLAN.map((s) => ({ ...s })));
    }
  }, [plan.length]);

  function updateSession(index: number, patch: Partial<InterviewPlanSession>) {
    updateField(
      "interview_plan",
      plan.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function reorderSessions(fromIdx: number, toIdx: number) {
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= plan.length ||
      toIdx >= plan.length
    ) {
      return;
    }
    const next = plan.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    updateField("interview_plan", next);
  }

  function addSession() {
    updateField("interview_plan", [
      ...plan,
      {
        title: "New session",
        startHour: 9,
        durationMinutes: 45,
        room: "SF-15-Bruce(6) [Zoom]",
        participants: [],
      },
    ]);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Define the default interview loop for this role. These sessions will be
        used as the starting template when scheduling candidates.
      </p>

      <InterviewPlanCardList
        interviews={plan}
        dateShort=""
        onUpdateInterview={updateSession}
        onReorderInterviews={reorderSessions}
        hideDateTime
      />

      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto w-fit gap-1.5 px-0"
        onClick={addSession}
      >
        <Plus className="size-3.5" />
        Add session
      </Button>
    </div>
  );
}
