import { PrismaClient } from '../src/generated/prisma/client'
import { lessons, levels, stories } from '../src/i18n/originalContent'
import prismaClient from '../src/lib/prisma'

// The answer key belongs exclusively to the server-side seed.
const correctOptions: Record<string, number> = {
  bonds_intro: 1,
  stocks_intro: 0,
  investments_risks: 2,
  time_value_of_money: 2,
}
const LEARNING_ELEMENTS = lessons.map(({ options, ...lesson }) => ({
  ...lesson,
  options: {
    create: options.map((content, index) => ({
      content,
      correct: index === correctOptions[lesson.id],
    })),
  },
}))
const requiredXP = [0, 100, 500, 1000, 3000]
const LEVELS = levels.map((level) => ({
  ...level,
  image: `levels/${level.index}.png`,
  requiredXP: requiredXP[level.index],
}))

async function main(prisma: PrismaClient) {
  await Promise.all(
    LEVELS.map((level) =>
      prisma.playerLevel.upsert({
        create: level,
        update: level,
        where: {
          index: level.index,
        },
      })
    )
  )

  await Promise.all(
    Object.entries(stories).map(([id, story]) =>
      prisma.storyElement.upsert({
        create: { id, ...story },
        update: story,
        where: { id },
      })
    )
  )

  await Promise.all(
    LEARNING_ELEMENTS.map((data) =>
      prisma.learningElement.upsert({
        create: data,
        update: {
          ...data,
          options: {
            deleteMany: {},
            createMany: {
              data: data.options.create,
            },
          },
        },
        where: { id: data.id },
      })
    )
  )
}

main(prismaClient)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prismaClient.$disconnect()
  })
