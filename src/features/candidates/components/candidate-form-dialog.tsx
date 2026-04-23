import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useCreateCandidate,
  useUpdateCandidate,
  type CandidateInsert,
} from "@/features/candidates/api/use-candidate-mutations";
import type { Candidate } from "@/types/database";

interface CandidateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
}

const EMPTY_FORM: CandidateInsert = {
  first_name: "",
  last_name: "",
  email: "",
  phone: null,
  location: null,
  headline: null,
  years_experience: null,
  current_company: null,
  current_title: null,
  work_history: [],
  education: [],
  skills: null,
  tags: null,
  notes: null,
  resume_url: null,
  avatar_url: null,
  last_activity_action: null,
  last_activity_at: null,
};

function candidateToForm(c: Candidate): CandidateInsert {
  const { id: _, created_at: __, ...rest } = c;
  return rest;
}

export function CandidateFormDialog({
  open,
  onOpenChange,
  candidate,
}: CandidateFormDialogProps) {
  const isEdit = !!candidate;
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();

  const [form, setForm] = useState<CandidateInsert>(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (open) {
      setForm(candidate ? candidateToForm(candidate) : EMPTY_FORM);
      setSkillInput("");
    }
  }, [open, candidate]);

  const isSubmitting = createCandidate.isPending || updateCandidate.isPending;
  const canSubmit =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.email.trim().length > 0;

  function set<K extends keyof CandidateInsert>(
    key: K,
    value: CandidateInsert[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (!skill) return;
    const current = form.skills ?? [];
    if (!current.includes(skill)) {
      set("skills", [...current, skill]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    const next = (form.skills ?? []).filter((s) => s !== skill);
    set("skills", next.length > 0 ? next : null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    if (isEdit && candidate) {
      await updateCandidate.mutateAsync({ id: candidate.id, ...form });
    } else {
      await createCandidate.mutateAsync(form);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit candidate" : "Add candidate"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name *</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name *</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone ?? ""}
                onChange={(e) =>
                  set("phone", e.target.value || null)
                }
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location ?? ""}
                onChange={(e) =>
                  set("location", e.target.value || null)
                }
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={form.headline ?? ""}
              onChange={(e) =>
                set("headline", e.target.value || null)
              }
              placeholder="Senior Software Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_company">Company</Label>
              <Input
                id="current_company"
                value={form.current_company ?? ""}
                onChange={(e) =>
                  set("current_company", e.target.value || null)
                }
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_title">Title</Label>
              <Input
                id="current_title"
                value={form.current_title ?? ""}
                onChange={(e) =>
                  set("current_title", e.target.value || null)
                }
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="years_experience">Years of experience</Label>
            <Input
              id="years_experience"
              type="number"
              min={0}
              value={form.years_experience ?? ""}
              onChange={(e) =>
                set(
                  "years_experience",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="5"
            />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill and press Enter"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSkill}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
            {form.skills && form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes ?? ""}
              onChange={(e) =>
                set("notes", e.target.value || null)
              }
              placeholder="Additional notes about the candidate..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save changes"
                : "Add candidate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
