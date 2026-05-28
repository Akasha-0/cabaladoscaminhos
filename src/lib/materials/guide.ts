/**
 * Materials Guide
 * Provides usage instructions and documentation for materials system.
 */

export interface GuideSection {
  title: string;
  content: string;
  examples?: string[];
}

export interface MaterialGuide {
  title: string;
  description: string;
  sections: GuideSection[];
  version: string;
}

export function getGuide(): MaterialGuide {
  return {
    title: "Materials System Guide",
    description: "Documentation for the materials and resources management system",
    version: "1.0.0",
    sections: [
      {
        title: "Overview",
        content: "The materials system provides a centralized way to manage and access application resources, assets, and content types.",
      },
      {
        title: "Usage",
        content: "Import and use the guide functions to access material documentation and usage patterns.",
        examples: [
          "import { getGuide } from '@/lib/materials/guide'",
          "const guide = getGuide()",
        ],
      },
      {
        title: "Best Practices",
        content: "Follow these guidelines when working with materials: organize by category, use consistent naming conventions, and document custom materials thoroughly.",
      },
    ],
  };
}