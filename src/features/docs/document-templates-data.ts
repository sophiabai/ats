export type DocVariableKind = "text" | "date"

export type DocVariable = {
  key: string
  label: string
  kind: DocVariableKind
}

export type DocTemplate = {
  id: string
  name: string
  variables: DocVariable[]
  bodyTemplate: string
}

export const BASE_DOC_TEMPLATES: DocTemplate[] = [
  {
    id: "tmpl-nda",
    name: "ACME candidate NDA",
    variables: [
      { key: "confidentialScope", label: "Confidential scope", kind: "text" },
      { key: "interviewDate", label: "Interview date", kind: "date" },
    ],
    bodyTemplate: `NON-DISCLOSURE AGREEMENT (CANDIDATE)

This agreement covers confidential information related to: {{confidentialScope}}.

By signing, you agree not to disclose this information outside of discussions with Acme recruiting and hiring teams.

Your interview is scheduled for {{interviewDate}}. Bring a government-issued photo ID.`,
  },
  {
    id: "tmpl-interview",
    name: "Interview preparation",
    variables: [],
    bodyTemplate: `INTERVIEW PREPARATION

Please arrive 10 minutes early. Dress is business casual unless your recruiter noted otherwise.

If you need accommodations, reply to your scheduling email and we will coordinate.`,
  },
  {
    id: "tmpl-office",
    name: "Instruction to the office",
    variables: [],
    bodyTemplate: `FRONT DESK CHECK-IN

Ask for recruiting at the front desk. You will receive a visitor badge. Wi-Fi guest access is available in the lobby.`,
  },
]

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Renders template body with variables; unfilled keys show as muted chips (HTML). */
export function renderDocumentBodyHtml(
  template: DocTemplate,
  values: Record<string, string>,
): string {
  let html = escapeHtml(template.bodyTemplate)
  for (const v of template.variables) {
    const raw = (values[v.key] ?? "").trim()
    const chip = raw
      ? escapeHtml(raw)
      : `<span class="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">[${escapeHtml(v.label)}]</span>`
    html = html.split(`{{${v.key}}}`).join(chip)
  }
  html = html.replace(/\n/g, "<br />")
  return html
}

export function templateById(
  templates: DocTemplate[],
  id: string,
): DocTemplate | undefined {
  return templates.find((t) => t.id === id)
}

export function missingVariableKeys(
  template: DocTemplate,
  values: Record<string, string>,
): string[] {
  return template.variables
    .map((v) => v.key)
    .filter((key) => !(values[key] ?? "").trim())
}
