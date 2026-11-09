-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "maxPlayers" INTEGER,
ADD COLUMN     "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registrationToken" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "enrollmentKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Game_registrationToken_key" ON "Game"("registrationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Player_gameId_enrollmentKey_key" ON "Player"("gameId", "enrollmentKey");

