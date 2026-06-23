# PROPOSAL: Improving Schema Coverage and Data Integrity

## Justification
To improve the "coverage" of our data model, we need to ensure that critical fields are mandatory when appropriate, reducing the risk of `null` values where data should be present. Specifically, focusing on `DailyReading` and `Consultation` models where optional fields might lead to incomplete data representation in our UI components.

## Proposed Changes (Prisma Schema Diff)

```prisma
--- a/apps/akasha-portal/prisma/schema.prisma
+++ b/apps/akasha-portal/prisma/schema.prisma
@@ -154,8 +154,8 @@
   // `cabala-transits.service`. Estrutura binária (6 linhas) em
   // `hexagramLines` para o `MandalaChart` e o `/daily` exibirem.
-  hexagram      Int?
-  hexagramLines Json?
+  hexagram      Int
+  hexagramLines Json
   createdAt    DateTime @default(now())
   @@unique([userId, date])
```

```prisma
--- a/apps/akasha-portal/prisma/schema.prisma
+++ b/apps/akasha-portal/prisma/schema.prisma
@@ -179,7 +179,7 @@
   // v0.0.5 T3 (Doc 14 §2): hexagrama sorteado (quando `user.ichingEnabled = true`
   // e o consulente escolhe o pilar `iching` no /oraculo).
-  hexagram  String?
+  hexagram  String
   detectedCrisis Boolean @default(false)
   crisisAudit    Json?
```

## Impact
- **Data Integrity**: Ensures that daily readings and consultations always contain the required hexagram data if they are meant to be I-Ching related.
- **UI Consistency**: Prevents runtime null-checking in components that depend on this data.
- **Migration**: Requires a data migration to populate these fields for existing records before applying the schema changes.
