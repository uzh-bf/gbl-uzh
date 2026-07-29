// Shared test scaffolding for the platform tRPC behavioral tests. No real
// database: prisma is a plain object of jest.fn()s that each test configures
// via mockResolvedValue/mockResolvedValueOnce for the calls it actually
// exercises. req/res are minimal stubs cast as any (the routers under test
// never read from them directly; only AccountService touches `res` via
// nookies, which no-ops when `getHeader`/`setHeader` are absent).
import { jest } from '@jest/globals'
import type { PlatformContext, PlatformUser } from '../src/trpc/context.js'

export function createMockPrisma() {
  return {
    game: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    player: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    playerResult: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    playerDecision: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    playerAction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    achievement: {
      findMany: jest.fn(),
    },
    achievementInstance: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    learningElement: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    storyElement: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    period: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    periodSegment: {
      update: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
    playerLevel: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

export function createTestContext({
  user,
  prisma,
}: {
  user?: PlatformUser
  prisma?: ReturnType<typeof createMockPrisma>
} = {}): PlatformContext {
  return {
    prisma: prisma ?? createMockPrisma(),
    req: {} as any,
    res: {} as any,
    user,
  }
}
