// learning.attempt grades a selection of option positions. A string
// selection must be checked at the router, because the service turns parse
// errors into a null result instead of a client error.
import { beforeEach, describe, expect, it } from 'vitest'
import { createPlatformRouter } from '../src/trpc/createPlatformRouter.js'
import { toLearningElementStateDto } from '../src/trpc/dto/learning.js'
import { createCallerFactory } from '../src/trpc/init.js'
import { UserRole } from '../src/types.js'
import { createMockPrisma, createTestContext, testSchemas } from './helpers.js'

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret'
})

const createCaller = createCallerFactory(
  createPlatformRouter({ schemas: testSchemas })
)

function playerCaller(prisma: ReturnType<typeof createMockPrisma>) {
  return createCaller(
    createTestContext({
      prisma,
      user: { sub: 'player-1', role: UserRole.PLAYER, gameId: 1 },
    })
  )
}

describe('learning.attempt selection', () => {
  it.each(['not json', '{"0":1}', '[1.5]', '["0"]', '[-1]'])(
    'rejects the malformed string selection %s as BAD_REQUEST',
    async (selection) => {
      const prisma = createMockPrisma()

      await expect(
        playerCaller(prisma).learning.attempt({ elementId: 'le-1', selection })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
      expect(prisma.learningElement.findUnique).not.toHaveBeenCalled()
    }
  )

  it('grades a valid string selection the same as the array form', async () => {
    const prisma = createMockPrisma()
    prisma.learningElement.findUnique.mockResolvedValue({
      id: 'le-1',
      feedback: null,
      options: [
        { id: 1, correct: true },
        { id: 2, correct: false },
      ],
    })

    const fromString = await playerCaller(prisma).learning.attempt({
      elementId: 'le-1',
      selection: '[1]',
    })
    const fromArray = await playerCaller(prisma).learning.attempt({
      elementId: 'le-1',
      selection: [1],
    })

    expect(fromString).toMatchObject({ pointsAchieved: 0, pointsMax: 2 })
    expect(fromArray).toEqual(fromString)
  })
})

describe('toLearningElementStateDto options', () => {
  it('keeps a malformed option as a placeholder so positions match grading', () => {
    const state = toLearningElementStateDto({
      id: 'le-1',
      element: {
        options: [
          { id: 1, content: 'First' },
          null,
          { id: 3, content: 42 },
          { id: 4, content: 'Fourth' },
        ],
      },
    })

    expect(state?.element.options?.map((option) => option.content)).toEqual([
      'First',
      '',
      '',
      'Fourth',
    ])
  })
})
