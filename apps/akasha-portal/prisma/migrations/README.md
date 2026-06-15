# Database Migrations

## Overview

This project uses Prisma with PostgreSQL for database management. All migrations are stored in `apps/akasha-portal/prisma/migrations/`.

## ⚠️ PROPOSAL-ONLY Policy (lesson N+22)

Some migrations are **proposals** that need human review before applying:
- D-040 (Prisma schema with 5 Pilares) — awaiting human approval
- F-238, F-239 (idempotency + timezone) — proposals from v0.0.20 spec

**Apply via `prisma migrate deploy` ONLY when:**
1. Migration is approved by human reviewer
2. Migration has been tested in dev/staging
3. Migration is in `20260611000000_init_akasha_v3/` or another already-approved location

## Current Migrations

### Approved (can apply)
- `20260611000000_init_akasha_v3/` — initial schema (D-040 v3)

### Proposals (NEED human approval before deploy)
- `20260615000000_push_last_pushed_at/` — F-238 idempotency (adds column to PushSubscription)
- `20260615000000_user_timezone/` — F-239 timezone-aware push (adds column to User)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Variables

| Variable       | Description                              | Required |
|---------------|------------------------------------------|----------|
| `DATABASE_URL` | PostgreSQL connection string             | Yes      |

## Commands

### Development

```bash
# Create and apply new migrations (creates migration files)
npm run db:migrate
# or: npx prisma migrate dev

# Generate Prisma Client after schema changes
npm run db:generate
# or: npx prisma generate
```

Use `prisma migrate dev` when:
- Modifying the schema in development
- Creating new migration files
- Working with a local database

### Production

```bash
# Apply existing migrations (without creating new ones)
npx prisma migrate deploy
```

Use `prisma migrate deploy` when:
- Deploying to production
- Applying migrations on CI/CD
- Only applying existing migration files

### Sync Schema (Development)

```bash
# Push schema changes without creating migration files
npm run db:push
# or: npx prisma db push
```

Use `prisma db push` when:
- Rapid prototyping
- Working with a test database
- Not needing migration history

### Open Prisma Studio

```bash
# Visual database browser
npm run db:studio
# or: npx prisma studio
```

## Seeding

Seed data is defined in `apps/akasha-portal/prisma/seed.ts`. To seed the database:

```bash
npx prisma db seed
```

For this to work, add the following to `package.json`:

```json
"prisma": {
  "seed": "tsx apps/akasha-portal/prisma/seed.ts"
}
```

## Schema Changes Workflow

1. **Development**: Modify `apps/akasha-portal/prisma/schema.prisma`
2. **Test locally**: Run `npx prisma migrate dev` or `npx prisma db push`
3. **Commit**: Include both schema changes and migration files
4. **Production**: Run `npx prisma migrate deploy`

## Troubleshooting

### Migration fails

Check that:
- `DATABASE_URL` is correctly set
- Database server is running
- User has sufficient permissions

### Reset database

```bash
# WARNING: Drops all tables and recreates
npx prisma migrate reset
```

### View migrations status

```bash
npx prisma migrate status
```