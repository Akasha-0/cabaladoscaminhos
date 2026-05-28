export interface LayoutPosition {
  index: number;
  x: number;
  y: number;
  rotation: number;
}

export interface SpreadLayout {
  spreadId: string;
  positions: LayoutPosition[];
}

const SINGLE_LAYOUT: SpreadLayout = {
  spreadId: 'single',
  positions: [
    { index: 0, x: 0, y: 0, rotation: 0 },
  ],
};

const THREE_CARD_LAYOUT: SpreadLayout = {
  spreadId: 'three-card',
  positions: [
    { index: 0, x: -1, y: 0, rotation: 0 },
    { index: 1, x: 0, y: 0, rotation: 0 },
    { index: 2, x: 1, y: 0, rotation: 0 },
  ],
};

const CELTIC_CROSS_LAYOUT: SpreadLayout = {
  spreadId: 'celtic-cross',
  positions: [
    { index: 0, x: 0, y: 0, rotation: 0 },
    { index: 1, x: 1, y: 0, rotation: 90 },
    { index: 2, x: -1, y: 1, rotation: 0 },
    { index: 3, x: -1, y: 2, rotation: 0 },
    { index: 4, x: -1, y: 3, rotation: 0 },
    { index: 5, x: 0, y: 4, rotation: 0 },
    { index: 6, x: 1, y: 3, rotation: 0 },
    { index: 7, x: 2, y: 2, rotation: 0 },
    { index: 8, x: 3, y: 1, rotation: 0 },
    { index: 9, x: 2, y: 0, rotation: 180 },
  ],
};

const layouts: SpreadLayout[] = [SINGLE_LAYOUT, THREE_CARD_LAYOUT, CELTIC_CROSS_LAYOUT];

export function getLayouts(): SpreadLayout[] {
  return layouts;
}

export function getLayoutBySpreadId(spreadId: string): SpreadLayout | undefined {
  return layouts.find((l) => l.spreadId === spreadId);
}
