---
name: migration-approval
description: Schema migrations and DDL require human approval — PROPOSAL only, never auto-apply.
condition:
  - 'prisma\s+migrate'
  - 'migrate\s+(dev|deploy|reset)'
  - 'schema\.prisma'
  - 'DROP\s+TABLE'
  - 'ALTER\s+TABLE'
interruptMode: always
---
STOP. Schema/migrations have production data risk and NEVER run automatically.

Produce a PROPOSAL in markdown (schema diff + justification), commit as `feat(schema): D-NNN — proposal (awaiting approval)` and STOP. Human applies manually.
