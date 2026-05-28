const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /ignore all previous instructions/i,
  /disregard all instructions/i,
  /forget all previous instructions/i,
  /\[\s*INST\s*\]/i,
  /<\s*INST\s*>/i,
  /system\s*:/i,
  /you are now/i,
  /act as if/i,
  /pretend you are/i,
  /you are a/i,
  /i am a/i,
];

export function sanitizeInput(input: string): string {
  let sanitized = input.trim();

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[filtrado]');
  }

  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}