// Free-will data module

export interface FreeWillData {
  id: string;
  name: string;
  description: string;
  category: string;
  properties: string[];
}

const data: FreeWillData[] = [
  {
    id: "fw-001",
    name: "Liberum Arbitrium",
    description: "The capacity to choose between good and evil, right and wrong.",
    category: "fundamental",
    properties: ["autonomy", "responsibility", "moral_reasoning"]
  },
  {
    id: "fw-002",
    name: "Voluntas",
    description: "The will as the faculty of intentional action and decision.",
    category: "fundamental",
    properties: ["intention", "deliberation", "choice"]
  },
  {
    id: "fw-003",
    name: "Rational Choice",
    description: "The ability to reason and deliberate before acting.",
    category: "cognitive",
    properties: ["reasoning", "deliberation", "evaluation"]
  },
  {
    id: "fw-004",
    name: "Self-Determination",
    description: "The power to determine one's own actions without external coercion.",
    category: "autonomous",
    properties: ["self-governance", "inner_direction", "authenticity"]
  },
  {
    id: "fw-005",
    name: "Moral Agency",
    description: "The capacity to be held morally accountable for one's choices.",
    category: "ethical",
    properties: ["accountability", "moral_reasoning", "ethical_judgment"]
  },
  {
    id: "fw-006",
    name: "Transcendent Will",
    description: "The will that transcends mere desire and impulse.",
    category: "spiritual",
    properties: ["higher_purpose", "spiritual_alignment", "divine_connection"]
  },
  {
    id: "fw-007",
    name: "Conscious Deliberation",
    description: "The process of conscious weighing of options before decision.",
    category: "cognitive",
    properties: ["awareness", "evaluation", "selection"]
  },
  {
    id: "fw-008",
    name: "Authentic Choice",
    description: "Choosing in alignment with one's true self and values.",
    category: "autonomous",
    properties: ["authenticity", "integrity", "self_alignment"]
  }
];

export function getData(): FreeWillData[] {
  return data;
}