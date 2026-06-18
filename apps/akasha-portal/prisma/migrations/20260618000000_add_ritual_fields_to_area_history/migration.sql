-- Migration: Add ritual fields to AreaHistoryEntry
-- Fixes schema drift: AreaHistoryEntry model references 5 columns that did not
-- exist in the database (ritualTitle, ritualInstruction, ritualDuration,
-- ritualElement, ritualColor), causing 500 errors on cycle/snapshot API calls.
--
-- Applied manually via psql to unblock development while proposal migrations
-- (push_last_pushed_at, user_timezone) are quarantined in prisma/proposals/.

ALTER TABLE "area_history" ADD COLUMN "ritualTitle" TEXT;
ALTER TABLE "area_history" ADD COLUMN "ritualInstruction" TEXT;
ALTER TABLE "area_history" ADD COLUMN "ritualDuration" TEXT;
ALTER TABLE "area_history" ADD COLUMN "ritualElement" TEXT;
ALTER TABLE "area_history" ADD COLUMN "ritualColor" TEXT;
