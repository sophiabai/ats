import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IntakeRow } from "@/features/intakes/api/use-intakes";

interface IntakesTableProps {
  data: IntakeRow[];
}

export function IntakesTable({ data }: IntakesTableProps) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Linked requisitions</TableHead>
          <TableHead>Last updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((intake) => (
          <TableRow
            key={intake.id}
            className="cursor-pointer"
            onClick={() => navigate(`/intakes/${intake.id}`)}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">
                  {intake.title || "Untitled intake"}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {intake.requisition_count} req
              {intake.requisition_count !== 1 ? "s" : ""}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(intake.updated_at), {
                addSuffix: true,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
