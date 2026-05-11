declare module "d3-org-chart" {
  export class OrgChart {
    container(node: HTMLElement): this;
    data(data: unknown[]): this;
    nodeWidth(fn: (d: unknown) => number): this;
    nodeHeight(fn: (d: unknown) => number): this;
    compactMarginBetween(fn: () => number): this;
    compactMarginPair(fn: () => number): this;
    neighbourMargin(fn: () => number): this;
    childrenMargin(fn: () => number): this;
    initialExpandLevel(level: number): this;
    nodeButtonX(fn: (d: unknown) => number): this;
    nodeButtonY(fn: (d: unknown) => number): this;
    nodeButtonWidth(fn: (d: unknown) => number): this;
    nodeButtonHeight(fn: (d: unknown) => number): this;
    nodeContent(fn: (d: unknown) => string): this;
    linkUpdate(fn: (this: SVGPathElement, d: unknown) => void): this;
    onNodeClick(fn: (d: unknown) => void): this;
    render(): this;
  }
}
