-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MASTER');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'PREPARATION', 'RUNNING', 'PAUSED', 'CONSOLIDATION', 'RESULTS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PlayerResultType" AS ENUM ('PERIOD_START', 'SEGMENT_START', 'SEGMENT_END', 'PERIOD_END');

-- CreateEnum
CREATE TYPE "PlayerDecisionType" AS ENUM ('PREPARATION', 'CONSOLIDATION');

-- CreateEnum
CREATE TYPE "AchievementFrequency" AS ENUM ('FIRST', 'EACH');

-- CreateEnum
CREATE TYPE "StoryElementType" AS ENUM ('GENERIC', 'ROLE_BASED');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "refreshTokenExpiresIn" INTEGER,
    "accessToken" TEXT,
    "expiresAt" INTEGER,
    "tokenType" TEXT,
    "scope" TEXT,
    "idToken" TEXT,
    "sessionState" TEXT,
    "oauthTokenSecret" TEXT,
    "oauthToken" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "name" TEXT NOT NULL,
    "activePeriodIx" INTEGER NOT NULL DEFAULT -1,
    "activePeriodId" INTEGER,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "facts" JSONB NOT NULL,
    "activeSegmentIx" INTEGER NOT NULL DEFAULT -1,
    "activeSegmentId" INTEGER,
    "nextPeriodId" INTEGER,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodSegment" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "facts" JSONB NOT NULL,
    "periodId" INTEGER NOT NULL,
    "periodIx" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "nextSegmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Cocoa AG',
    "avatar" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'White',
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "experienceToNext" INTEGER NOT NULL DEFAULT 100,
    "levelIx" INTEGER NOT NULL,
    "tutorialCompleted" BOOLEAN NOT NULL DEFAULT false,
    "facts" JSONB NOT NULL,
    "role" TEXT,
    "token" TEXT NOT NULL,
    "achievementKeys" TEXT[],
    "achievementIds" TEXT[],
    "completedLearningElementIds" TEXT[],
    "visitedStoryElementIds" TEXT[],
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerId" UUID NOT NULL,
    "periodId" INTEGER NOT NULL,
    "periodIx" INTEGER NOT NULL,
    "segmentId" INTEGER,
    "segmentIx" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerResult" (
    "id" SERIAL NOT NULL,
    "type" "PlayerResultType" NOT NULL,
    "facts" JSONB NOT NULL,
    "playerId" UUID NOT NULL,
    "gameId" INTEGER NOT NULL,
    "periodId" INTEGER NOT NULL,
    "periodIx" INTEGER NOT NULL,
    "segmentId" INTEGER,
    "segmentIx" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerDecision" (
    "id" SERIAL NOT NULL,
    "type" "PlayerDecisionType" NOT NULL,
    "facts" JSONB NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerId" UUID NOT NULL,
    "periodId" INTEGER NOT NULL,
    "periodIx" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLevel" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "requiredXP" INTEGER NOT NULL,

    CONSTRAINT "PlayerLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "onEventId" TEXT NOT NULL,
    "when" "AchievementFrequency" NOT NULL,
    "reward" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementInstance" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "achievementId" TEXT NOT NULL,
    "playerId" UUID NOT NULL,
    "periodId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AchievementInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAnswerOption" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "learningElementSlug" TEXT NOT NULL,

    CONSTRAINT "LearningAnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningElement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "feedback" TEXT,
    "motivation" TEXT,
    "reward" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryElement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "StoryElementType" NOT NULL DEFAULT 'GENERIC',
    "content" TEXT,
    "contentRole" JSONB,
    "reward" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PeriodSegmentToStoryElement" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PlayerToStoryElement" (
    "A" UUID NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_LearningElementToPeriodSegment" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LearningElementToPlayer" (
    "A" TEXT NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Period_gameId_index_key" ON "Period"("gameId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodSegment_gameId_periodIx_index_key" ON "PeriodSegment"("gameId", "periodIx", "index");

-- CreateIndex
CREATE UNIQUE INDEX "Player_token_key" ON "Player"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerResult_periodIx_segmentIx_playerId_type_key" ON "PlayerResult"("periodIx", "segmentIx", "playerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerDecision_playerId_periodIx_type_key" ON "PlayerDecision"("playerId", "periodIx", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLevel_index_key" ON "PlayerLevel"("index");

-- CreateIndex
CREATE INDEX "AchievementInstance_playerId_achievementId_idx" ON "AchievementInstance"("playerId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "_PeriodSegmentToStoryElement_AB_unique" ON "_PeriodSegmentToStoryElement"("A", "B");

-- CreateIndex
CREATE INDEX "_PeriodSegmentToStoryElement_B_index" ON "_PeriodSegmentToStoryElement"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerToStoryElement_AB_unique" ON "_PlayerToStoryElement"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerToStoryElement_B_index" ON "_PlayerToStoryElement"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LearningElementToPeriodSegment_AB_unique" ON "_LearningElementToPeriodSegment"("A", "B");

-- CreateIndex
CREATE INDEX "_LearningElementToPeriodSegment_B_index" ON "_LearningElementToPeriodSegment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LearningElementToPlayer_AB_unique" ON "_LearningElementToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_LearningElementToPlayer_B_index" ON "_LearningElementToPlayer"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_activePeriodId_fkey" FOREIGN KEY ("activePeriodId") REFERENCES "Period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_activeSegmentId_fkey" FOREIGN KEY ("activeSegmentId") REFERENCES "PeriodSegment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_nextPeriodId_fkey" FOREIGN KEY ("nextPeriodId") REFERENCES "Period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodSegment" ADD CONSTRAINT "PeriodSegment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodSegment" ADD CONSTRAINT "PeriodSegment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodSegment" ADD CONSTRAINT "PeriodSegment_nextSegmentId_fkey" FOREIGN KEY ("nextSegmentId") REFERENCES "PeriodSegment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_levelIx_fkey" FOREIGN KEY ("levelIx") REFERENCES "PlayerLevel"("index") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "PeriodSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "PeriodSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDecision" ADD CONSTRAINT "PlayerDecision_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDecision" ADD CONSTRAINT "PlayerDecision_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDecision" ADD CONSTRAINT "PlayerDecision_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_onEventId_fkey" FOREIGN KEY ("onEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementInstance" ADD CONSTRAINT "AchievementInstance_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementInstance" ADD CONSTRAINT "AchievementInstance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementInstance" ADD CONSTRAINT "AchievementInstance_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementInstance" ADD CONSTRAINT "AchievementInstance_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAnswerOption" ADD CONSTRAINT "LearningAnswerOption_learningElementSlug_fkey" FOREIGN KEY ("learningElementSlug") REFERENCES "LearningElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodSegmentToStoryElement" ADD CONSTRAINT "_PeriodSegmentToStoryElement_A_fkey" FOREIGN KEY ("A") REFERENCES "PeriodSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodSegmentToStoryElement" ADD CONSTRAINT "_PeriodSegmentToStoryElement_B_fkey" FOREIGN KEY ("B") REFERENCES "StoryElement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToStoryElement" ADD CONSTRAINT "_PlayerToStoryElement_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToStoryElement" ADD CONSTRAINT "_PlayerToStoryElement_B_fkey" FOREIGN KEY ("B") REFERENCES "StoryElement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LearningElementToPeriodSegment" ADD CONSTRAINT "_LearningElementToPeriodSegment_A_fkey" FOREIGN KEY ("A") REFERENCES "LearningElement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LearningElementToPeriodSegment" ADD CONSTRAINT "_LearningElementToPeriodSegment_B_fkey" FOREIGN KEY ("B") REFERENCES "PeriodSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LearningElementToPlayer" ADD CONSTRAINT "_LearningElementToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "LearningElement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LearningElementToPlayer" ADD CONSTRAINT "_LearningElementToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
