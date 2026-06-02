export interface ChakraV4Data {
  id: string;
  name: string;
  color: string;
  frequency: number;
}

const DATA: ChakraV4Data[] = [];

export function getData(): ChakraV4Data[] { return DATA; }
