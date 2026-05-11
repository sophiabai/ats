import { useRef, useEffect, useCallback } from "react";
import { OrgChart } from "d3-org-chart";
import type { Employee } from "../types";
import { DEPARTMENT_COLORS } from "../data";

interface OrgChartViewerProps {
  data: Employee[];
  onNodeClick?: (node: Employee) => void;
  /** Tree depth expanded on initial render. Defaults to 1 (root only). */
  expandLevel?: number;
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

// Hover styles are injected once into <head>. d3-org-chart renders cards as raw
// HTML strings, so we can't use Tailwind utilities or React event handlers —
// a class + global stylesheet is the cleanest hook.
const HOVER_STYLE_ID = "org-chart-card-hover-styles";
function ensureHoverStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(HOVER_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HOVER_STYLE_ID;
  style.textContent = `
    .org-chart-card {
      transition: border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease;
    }
    .org-chart-card:hover {
      border-color: #c7c5cd !important;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.10) !important;
    }
    .dark .org-chart-card:hover {
      border-color: #78716c !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55) !important;
    }
    /* d3-org-chart's expand/collapse node button. The library wraps the pill
       in an outer flex container, so we drop one level deeper to hit the
       actual pill element. Inline styles need !important to be overridden. */
    .node-button-foreign-object > div > div {
      transition: background-color 120ms ease;
    }
    .node-button-foreign-object:hover > div > div {
      background-color: #f3f4f6 !important;
    }
    .dark .node-button-foreign-object:hover > div > div {
      background-color: #292524 !important;
    }
  `;
  document.head.appendChild(style);
}

interface ReportCounts {
  direct: (id: string) => number;
  total: (id: string) => number;
}

function computeReportCounts(data: Employee[]): ReportCounts {
  const childrenById = new Map<string, string[]>();
  for (const e of data) {
    if (!e.parentId) continue;
    const arr = childrenById.get(e.parentId) ?? [];
    arr.push(e.id);
    childrenById.set(e.parentId, arr);
  }

  const totalById = new Map<string, number>();
  function dfs(id: string): number {
    const cached = totalById.get(id);
    if (cached !== undefined) return cached;
    const children = childrenById.get(id) ?? [];
    let total = children.length;
    for (const childId of children) total += dfs(childId);
    totalById.set(id, total);
    return total;
  }
  for (const e of data) dfs(e.id);

  return {
    direct: (id) => (childrenById.get(id) ?? []).length,
    total: (id) => totalById.get(id) ?? 0,
  };
}

const USERS_ICON_SVG = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

function nodeHTML(emp: Employee, counts: ReportCounts) {
  const color = DEPARTMENT_COLORS[emp.department] ?? "#64748b";
  const dark = isDark();
  const bg = dark ? "#1c1917" : "#ffffff";
  const border = dark ? "#44403c" : "#e2e0e6";
  const nameColor = dark ? "#fafaf9" : "#1a1523";
  const titleColor = dark ? "#a8a29e" : "#65636d";
  const avatarBg = dark ? "#292524" : "#f3f4f6";
  const shadow = dark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.06)";
  const chipBg = dark ? "#27272a" : "#f3f4f6";
  const chipBorder = dark ? "#3f3f46" : "#e5e7eb";
  const chipText = dark ? "#a8a29e" : "#65636d";
  const chipDivider = dark ? "#52525b" : "#cbd5e1";

  const direct = counts.direct(emp.id);
  const total = counts.total(emp.id);
  const reportsBadge =
    direct > 0
      ? `
        <div style="
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 500; color: ${chipText};
          background: ${chipBg}; border: 1px solid ${chipBorder};
          border-radius: 6px; padding: 1px 8px 1px 6px;
          flex-shrink: 0;
        ">
          ${USERS_ICON_SVG}
          ${direct}
          <span style="color: ${chipDivider}; font-weight: 400;">|</span>
          ${total}
        </div>`
      : "";

  return `
    <div class="org-chart-card" style="
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      width: 258px;
      box-sizing: border-box;
      background: ${bg};
      border-radius: 12px;
      border: 1px solid ${border};
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px 18px 12px;
      box-shadow: ${shadow}; cursor: pointer;
    ">
      <img src="${emp.imageUrl}" style="
        width: 38px; height: 38px; border-radius: 50%;
        background: ${avatarBg}; flex-shrink: 0; object-fit: cover;
      " />
      <div style="min-width: 0; flex: 1;">
        <div style="
          font-weight: 600; font-size: 13px; color: ${nameColor};
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        ">${emp.name}</div>
        <div style="
          font-size: 11px; color: ${titleColor}; margin-top: 1px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        ">${emp.title}</div>
        <div style="
          margin-top: 4px;
          display: flex; align-items: center; gap: 24px;
          justify-content: space-between; min-width: 0;
        ">
          <div title="${emp.department === emp.subDepartment ? emp.department : `${emp.department} › ${emp.subDepartment}`}" style="
            display: inline-flex; align-items: center; gap: 4px;
            font-size: 10px; font-weight: 500; color: ${color};
            background: ${color}14; border: 1px solid ${color}30;
            border-radius: 6px; padding: 1px 8px 1px 6px;
            min-width: 0; max-width: 100%;
          ">
            <span style="
              width: 6px; height: 6px; border-radius: 50%;
              background: ${color}; flex-shrink: 0;
            "></span>
            <span style="
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
              min-width: 0;
            ">${emp.subDepartment}</span>
          </div>${reportsBadge}
        </div>
      </div>
    </div>
  `;
}

export function OrgChartViewer({
  data,
  onNodeClick,
  expandLevel = 1,
}: OrgChartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<OrgChart | null>(null);

  const renderChart = useCallback(() => {
    if (!containerRef.current || data.length === 0) return;

    ensureHoverStyles();

    if (!chartRef.current) {
      chartRef.current = new OrgChart();
    }

    const dark = isDark();
    const counts = computeReportCounts(data);

    chartRef.current
      .container(containerRef.current)
      .data(data)
      .nodeWidth(() => 260)
      .nodeHeight(() => 84)
      .nodeButtonY(() => -26)
      .compactMarginBetween(() => 35)
      .compactMarginPair(() => 60)
      .neighbourMargin(() => 40)
      .childrenMargin(() => 60)
      .initialExpandLevel(expandLevel)
      .nodeContent((d: unknown) => nodeHTML((d as { data: Employee }).data, counts))
      .linkUpdate(function (this: SVGPathElement) {
        const el = this as unknown as SVGPathElement;
        el.setAttribute("stroke", dark ? "#44403c" : "#e2e0e6");
        el.setAttribute("stroke-width", "1");
      })
      .onNodeClick((d: unknown) => {
        onNodeClick?.((d as { data: Employee }).data);
      })
      .render();
  }, [data, onNodeClick, expandLevel]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      chartRef.current?.render();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
