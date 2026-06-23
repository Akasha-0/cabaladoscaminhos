// omp session hook — CodeGraph + Headroom init
// Runs on every omp session start to ensure tools are available.
// This hook is auto-loaded when placed in .omp/hooks/

const codegraphBin = `${require("os").homedir()}/.npm-global/bin/codegraph`;

async function main() {
  // 1. Verify codegraph is accessible
  try {
    const result = await $`${codegraphBin} status --json 2>/dev/null || true`;
    const data = JSON.parse(result.stdout || "{}");
    if (data.files) {
      console.log(`[codegraph] ${data.files} files, ${data.nodes} nodes indexed`);
    }
  } catch {
    // codegraph may not be installed; skip silently
  }

  // 2. Verify headroom proxy is running
  try {
    const resp = await fetch("http://127.0.0.1:8787/health", { timeout: 2000 });
    if (resp.ok) {
      console.log(`[headroom] proxy healthy (port 8787)`);
    }
  } catch {
    // headroom proxy not running; skip silently
    console.log(`[headroom] proxy not available — start with: headroom proxy`);
  }
}

module.exports = { main };