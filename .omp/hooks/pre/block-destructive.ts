import type { HookAPI, ToolCallEvent } from "@oh-my-pi/pi-coding-agent/dist/types/extensibility/hooks/types";
import type { ToolCallEventResult } from "@oh-my-pi/pi-coding-agent/dist/types/extensibility/shared-events";

/**
 * block-destructive.ts
 *
 * Blocks destructive commands and schema migrations in autonomous loop mode.
 * The agent receives the `reason` and takes an alternate path (e.g., produce a PROPOSAL).
 *
 * Events: tool_call (bash)
 */
const DESTRUCTIVE_PATTERNS = [
  // Destructive git
  /\bgit\s+push\s+(-f|--force)/i,
  /\bgit\s+reset\s+--hard/i,
  /\bgit\s+clean\s+-[a-z]*f/i,
  // Destructive filesystem
  /\brm\s+-rf\b/i,
  // Schema migrations — never run automatically
  /\bprisma\s+migrate\b/i,
  /\bmigrate\s+(dev|deploy|reset)/i,
  /\bDROP\s+TABLE\b/i,
  /\bTRUNCATE\b/i,
];

export default function hook(pi: HookAPI): void {
  pi.on("tool_call", async (event: ToolCallEvent): Promise<ToolCallEventResult | undefined> => {
    if (event.toolName !== "bash") return undefined;

    if (
      typeof event.input === "object" &&
      event.input !== null &&
      "command" in event.input
    ) {
      const cmd = String(event.input.command ?? "");
      if (DESTRUCTIVE_PATTERNS.some((p) => p.test(cmd))) {
        return {
          block: true,
          reason:
            "Destructive command / migration blocked in autonomous loop. " +
            "Schema migrations: produce a PROPOSAL (diff + justification) and commit it as " +
            "`feat(schema): D-NNN — proposal (awaiting approval)`, then stop. " +
            "Destructive git/filesystem operations require human confirmation.",
        };
      }
    }
    return undefined;
  });
}
