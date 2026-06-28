// ============================================================================
// FEATURE FLAG STORAGE — JSON file persistence (Wave 20)
// ============================================================================
// Storage simples em /data/flags.json. Substituível por PostHog/LaunchDarkly
// no futuro sem mudar a API pública.
//
// Por que JSON e não Postgres?
//   - Flags são lidas em TODA request → precisa ser rápido
//   - Volume de writes é baixo (admin toggles, não tráfego)
//   - Zero dependência externa (PostHog ausente no /package.json)
//   - Trivial de inspecionar/auditar via Read tool
//
// Operações expostas:
//   - readFlags()      → snapshot atual { [key]: FlagState }
//   - upsertFlag()     → admin toggle
//   - addToWhitelist() → adiciona userId a whitelist
//   - removeFromWhitelist()
//   - resetAllFlags()  → disaster recovery
//
// Concorrência: Node single-thread + write-atômico via fs.writeFileSync.
// Para produção real, trocar por Redis/Postgres com versioning.
// ============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { listFlags, type FeatureFlagDefinition } from './flags';

// ============================================================================
// Types
// ============================================================================

export interface FlagState {
  /** Override do valor default (true/false); null = usa default */
  enabled: boolean | null;
  /** Override de rollout % (apenas type='percentage') */
  rolloutPercent?: number;
  /** Override de whitelist (apenas type='percentage') */
  whitelist?: string[];
  /** Última modificação (audit trail) */
  updatedAt: string;
  /** Quem modificou (userId ou 'system') */
  updatedBy?: string;
}

export type FlagsSnapshot = Record<string, FlagState>;

// ============================================================================
// Paths
// ============================================================================

const DATA_DIR = path.join(process.cwd(), 'data');
const FLAGS_FILE = path.join(DATA_DIR, 'flags.json');

// ============================================================================
// I/O
// ============================================================================

async function ensureFile(): Promise<void> {
  try {
    await fs.access(FLAGS_FILE);
  } catch {
    // Primeira inicialização — cria com defaults
    await fs.mkdir(DATA_DIR, { recursive: true });
    const initial: FlagsSnapshot = {};
    for (const def of listFlags()) {
      initial[def.key] = {
        enabled: null, // null = segue defaultValue da definição
        rolloutPercent: def.rolloutPercent,
        whitelist: def.whitelist ?? [],
        updatedAt: new Date().toISOString(),
        updatedBy: 'system',
      };
    }
    await fs.writeFile(FLAGS_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

export async function readFlags(): Promise<FlagsSnapshot> {
  await ensureFile();
  const raw = await fs.readFile(FLAGS_FILE, 'utf8');
  try {
    return JSON.parse(raw) as FlagsSnapshot;
  } catch {
    // Arquivo corrompido — loga e retorna snapshot vazio
    // (getFlag vai usar defaults da definição)
    console.error('[feature-flags] flags.json corrompido — usando defaults');
    return {};
  }
}

async function writeFlags(snapshot: FlagsSnapshot): Promise<void> {
  await ensureFile();
  // Write atômico: escreve em temp, depois rename
  const tmp = `${FLAGS_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(snapshot, null, 2), 'utf8');
  await fs.rename(tmp, FLAGS_FILE);
}

// ============================================================================
// Mutators
// ============================================================================

export interface FlagUpdate {
  enabled?: boolean | null;
  rolloutPercent?: number;
  addToWhitelist?: string;
  removeFromWhitelist?: string;
  updatedBy?: string;
}

export async function upsertFlag(
  key: string,
  update: FlagUpdate
): Promise<FlagState> {
  const snapshot = await readFlags();
  const current: FlagState = snapshot[key] ?? {
    enabled: null,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  };

  const next: FlagState = {
    ...current,
    updatedAt: new Date().toISOString(),
    updatedBy: update.updatedBy ?? 'admin',
  };

  if (update.enabled !== undefined) next.enabled = update.enabled;
  if (update.rolloutPercent !== undefined) next.rolloutPercent = update.rolloutPercent;

  if (update.addToWhitelist) {
    const list = new Set(current.whitelist ?? []);
    list.add(update.addToWhitelist);
    next.whitelist = Array.from(list);
  }
  if (update.removeFromWhitelist) {
    const list = new Set(current.whitelist ?? []);
    list.delete(update.removeFromWhitelist);
    next.whitelist = Array.from(list);
  }

  snapshot[key] = next;
  await writeFlags(snapshot);
  return next;
}

export async function resetAllFlags(): Promise<void> {
  const initial: FlagsSnapshot = {};
  for (const def of listFlags()) {
    initial[def.key] = {
      enabled: null,
      rolloutPercent: def.rolloutPercent,
      whitelist: def.whitelist ?? [],
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    };
  }
  await writeFlags(initial);
}
