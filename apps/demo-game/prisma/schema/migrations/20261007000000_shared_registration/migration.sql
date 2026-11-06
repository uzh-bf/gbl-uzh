CREATE TYPE "RegistrationMode" AS ENUM ('FIXED', 'SHARED_LINK');
ALTER TABLE "Game"
  ADD COLUMN "registrationMode" "RegistrationMode" NOT NULL DEFAULT 'FIXED',
  ADD COLUMN "registrationToken" TEXT,
  ADD COLUMN "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "maxPlayers" INTEGER;
ALTER TABLE "Player" ADD COLUMN "enrollmentKey" TEXT, ADD COLUMN "setupEventPending" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "Game_registrationToken_key" ON "Game"("registrationToken");
CREATE UNIQUE INDEX "Player_gameId_enrollmentKey_key" ON "Player"("gameId", "enrollmentKey");
ALTER TABLE "Game" ADD CONSTRAINT "Game_maxPlayers_positive" CHECK ("maxPlayers" IS NULL OR "maxPlayers" > 0);
