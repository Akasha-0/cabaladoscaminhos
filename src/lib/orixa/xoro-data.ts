// Xoro data
export interface XoroData {
  name: string;
  description: string;
  attributes: Record<string, string | number>;
}

const data: XoroData[] = [
  {
    name: "Xoro",
    description: "The primal force of creation and transformation",
    attributes: {
      element: "Spirit",
      aspect: "Primal",
      sphere: "Transformation",
    },
  },
];

export function getData(): XoroData[] {
  return data;
}
