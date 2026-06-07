# Database Migrations

## Overview

This project uses Prisma with PostgreSQL for database management. All migrations are stored in `prisma/migrations/`.

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

Seed data is defined in `prisma/seed.ts`. To seed the database:

```bash
npx prisma db seed
```

For this to work, add the following to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

## Schema Changes Workflow

1. **Development**: Modify `prisma/schema.prisma`
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