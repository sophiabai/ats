import { useLocation, useNavigate } from "react-router";
import type { BreadcrumbState } from "@/app/layout";
import {
  RequisitionFormBody,
  type FormState,
} from "@/features/requisitions/components/create-requisition-dialog";

interface NewReqLocationState extends BreadcrumbState {
  initialData?: Partial<FormState>;
  autoGenerate?: boolean;
  successBreadcrumb?: BreadcrumbState;
}

export function Component() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: NewReqLocationState | null };
  const initialData = state?.initialData;
  const autoGenerate = state?.autoGenerate;

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <h1 className="text-2xl font-semibold mb-4">New requisition</h1>
      <div className="flex flex-1 min-h-0 rounded-lg border overflow-hidden">
        <RequisitionFormBody
          initialData={initialData}
          autoGenerate={autoGenerate}
          onCancel={() => navigate(-1)}
          onCreated={(id) => {
            navigate(`/requisitions/${id}`, {
              replace: true,
              state: state?.successBreadcrumb,
            });
          }}
          className="flex-1 min-h-0"
        />
      </div>
    </div>
  );
}

export { Component as RequisitionNewPage };
