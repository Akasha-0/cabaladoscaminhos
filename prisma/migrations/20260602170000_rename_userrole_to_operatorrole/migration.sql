-- Rename UserRole enum to OperatorRole
DROP TYPE IF EXISTS "UserRole";
CREATE TYPE "OperatorRole" AS ENUM ('OPERATOR', 'ADMIN');

-- Update Operator.role column to use new enum type
ALTER TABLE "operators" ALTER COLUMN "role" TYPE "OperatorRole" USING ("role"::text::"OperatorRole");
