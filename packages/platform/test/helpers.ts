// Shared test scaffolding for the platform tRPC behavioral tests. No real
// database: prisma is a plain object of vi.fn()s that each test configures
// via mockResolvedValue/mockResolvedValueOnce for the calls it actually
// exercises. req/res are minimal stubs cast as any (the routers under test
// never read from them directly; only AccountService touches `res` via
// nookies, which no-ops when `getHeader`/`setHeader` are absent).
import { vi } from 'vitest'
import type { PlatformContext, PlatformUser } from '../src/trpc/context.js'

export function createMockPrisma() {
  return {
    game: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    player: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    playerResult: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    playerDecision: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    playerAction: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    achievement: {
      findMany: vi.fn(),
    },
    achievementInstance: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    learningElement: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    storyElement: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    period: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    periodSegment: {
      update: vi.fn(),
    },
    event: {
      findMany: vi.fn(),
    },
    playerLevel: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
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
