// Prisma 7: configuration lives here instead of in schema.prisma's
// `datasource db { url = ... }` block (which was removed in v7). The CLI
// reads `datasource.url` from this file for `db push` / `migrate`.
//
// Connection string comes from the workspace-root .env (DATABASE_URL).
// We load it explicitly because the Prisma CLI is invoked from
// `apps/akasha-portal/`, so cwd-relative dotenv would only see the
// app-local .env (which points to a different local DB). Next.js itself
// loads the root .env at runtime, so the Prisma CLI must do the same to
// stay consistent with the running app.
import { config as loadRootEnv } from 'dotenv';
import { config as loadLocalEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const here = path.dirname(fileURLToPath(import.meta.url));
// Root .env (workspace-level) is the source of truth for DATABASE_URL —
// Next.js loads it at runtime, so the Prisma CLI must too. The app-local
// .env points to a different local DB and is intentionally NOT loaded
// here (no `override: true`) to stay consistent with runtime.
loadRootEnv({ path: path.resolve(here, '../../.env') });

export default defineConfig({
  schema: path.resolve(here, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: path.resolve(here, 'prisma/migrations'),
  },
});
