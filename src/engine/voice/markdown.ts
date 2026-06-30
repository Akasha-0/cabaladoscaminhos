// ============================================================================
// Markdown → plain TTS rendering (cycle-75 markdown patterns reuse)
// ============================================================================
// Strips code fences/inline code/bold/italic/headings, converts blockquotes
// to "Citação: ", bullets to "Item: ", drops URLs from links, drops images.
// ============================================================================

export function markdownToPlain(input: string): string {
  if (!input) return '';

  let text = input;

  // Fenced code blocks (```...```) — drop entirely
  text = text.replace(/```[\s\S]*?```/g, ' ');

  // Inline code (`x`) — keep inner text
  text = text.replace(/`([^`]+)`/g, '$1');

  // Images ![alt](url) — drop entirely (alt + url)
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');

  // Links [text](url) — keep text, drop URL
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Headings (## Heading) — keep heading text
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Bold/italic (preserve inner text)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // Blockquotes (> text) — prefix with "Citação: "
  text = text.replace(/^>\s?/gm, 'Citação: ');

  // Bullets (- text or * text) — prefix with "Item: "
  text = text.replace(/^[-*]\s+/gm, 'Item: ');

  // Numbered lists — keep but strip the number
  text = text.replace(/^\d+\.\s+/gm, '');

  // Collapse excess whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
