import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAddPosition } from "@/features/headcount-planning/api/use-add-position";

interface AddPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Customer Success",
];

export function AddPositionDialog({
  open,
  onOpenChange,
}: AddPositionDialogProps) {
  const addPosition = useAddPosition();
  const [form, setForm] = React.useState({
    title: "",
    department: "",
    level: "",
    location: "",
    employment_type: "full_time",
    cost_center: "",
    salary_min: "",
    salary_max: "",
    priority: "medium",
    hiring_manager: "",
    target_date: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm({
      title: "",
      department: "",
      level: "",
      location: "",
      employment_type: "full_time",
      cost_center: "",
      salary_min: "",
      salary_max: "",
      priority: "medium",
      hiring_manager: "",
      target_date: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addPosition.mutateAsync({
      title: form.title,
      department: form.department,
      level: form.level,
      location: form.location,
      employment_type: form.employment_type,
      cost_center: form.cost_center,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      priority: form.priority,
      hiring_manager: form.hiring_manager,
      target_date: form.target_date,
      in_plan: true,
    });
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add open position</DialogTitle>
          <DialogDescription>
            A position ID will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Position title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Department</Label>
              <Select
                required
                value={form.department}
                onValueChange={(v) => updateField("department", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                value={form.level}
                onChange={(e) => updateField("level", e.target.value)}
                placeholder="e.g. L5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. San Francisco"
              />
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
              <Label htmlFor="salary_min">Salary min</Label>
              <Input
                id="salary_min"
                type="number"
                value={form.salary_min}
                onChange={(e) => updateField("salary_min", e.target.value)}
                placeholder="e.g. 150000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary_max">Salary max</Label>
              <Input
                id="salary_max"
                type="number"
                value={form.salary_max}
                onChange={(e) => updateField("salary_max", e.target.value)}
                placeholder="e.g. 200000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => updateField("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost_center">Cost center</Label>
              <Input
                id="cost_center"
                value={form.cost_center}
                onChange={(e) => updateField("cost_center", e.target.value)}
                placeholder="e.g. ENG-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hiring_manager">Hiring manager</Label>
              <Input
                id="hiring_manager"
                value={form.hiring_manager}
                onChange={(e) => updateField("hiring_manager", e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target_date">Target date</Label>
              <Input
                id="target_date"
                type="date"
                value={form.target_date}
                onChange={(e) => updateField("target_date", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addPosition.isPending}>
              {addPosition.isPending ? "Adding..." : "Add position"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
