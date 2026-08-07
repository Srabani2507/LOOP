-- Migration: simplify_feedback_status
-- Remove PROCESSING, ANALYZED, FAILED from FeedbackStatus enum
-- First migrate any rows that still use the old values to NEW

UPDATE "feedbacks" SET "status" = 'NEW' WHERE "status" IN ('PROCESSING', 'ANALYZED', 'FAILED');

-- Recreate the enum with only the 3 triage values
-- PostgreSQL requires: create new type → alter column → drop old → rename

DROP TYPE IF EXISTS "FeedbackStatus_new";
CREATE TYPE "FeedbackStatus_new" AS ENUM ('NEW', 'REVIEWED', 'ACTIONED');

ALTER TABLE "feedbacks" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "feedbacks"
  ALTER COLUMN "status" TYPE "FeedbackStatus_new"
  USING "status"::text::"FeedbackStatus_new";

ALTER TABLE "feedbacks" ALTER COLUMN "status" SET DEFAULT 'NEW'::"FeedbackStatus_new";

DROP TYPE "FeedbackStatus";

ALTER TYPE "FeedbackStatus_new" RENAME TO "FeedbackStatus";
