import type { HookAPI, ToolCallEvent } from "@oh-my-pi/pi-coding-agent/dist/types/extensibility/hooks/types";
import type { ToolCallEventResult } from "@oh-my-pi/pi-coding-agent/dist/types/extensibility/shared-events";

/**
 * require-omp-commit.ts
 *
 * Forces commits through `omp commit` (atomic split commits + changelog + validation)
 * instead of raw `git commit`.
 *
 * The triad green check is handled by pre-commit.sh (shell hook).
 * This hook ensures the commit channel goes through the OMP tooling.
 *
 * Events: tool_call (bash)
 */
const RAW_GIT_COMMIT = /\bgit\s+commit\b/i;

export default function hook(pi: HookAPI): void {
  pi.on("tool_call", async (event: ToolCallEvent): Promise<ToolCallEventResult | undefined> => {
    if (event.toolName !== "bash") return undefined;

    if (
      typeof event.input === "object" &&
      event.input !== null &&
      "command" in event.input
    ) {
      const cmd = String(event.input.command ?? "");
      if (RAW_GIT_COMMIT.test(cmd)) {
        return {
          block: true,
          reason:
            "Do not use raw `git commit`. After the qa agent confirms triad green, " +
            "run `omp commit` instead — it produces atomic split commits, validates the " +
            "message format, and updates the CHANGELOG automatically.",
        };
      }
    }
    return undefined;
  });
}
