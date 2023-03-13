import { PrismaClient } from '@prisma/client'

const LEVELS = [
  {
    index: 0,
    description: 'Hello, World',
    image: 'levels/0.png',
    requiredXP: 0,
  },
  {
    index: 1,
    description: 'Starting Out',
    image: 'levels/1.png',
    requiredXP: 100,
  },
  {
    index: 2,
    description: 'Levelling Up',
    image: 'levels/2.png',
    requiredXP: 500,
  },
  {
    index: 3,
    description: 'Advancing Further',
    image: 'levels/3.png',
    requiredXP: 1000,
  },
  {
    index: 4,
    description: 'Achieving Mastery',
    image: 'levels/4.png',
    requiredXP: 3000,
  },
]

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
}

const prismaClient = new PrismaClient()

main(prismaClient)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prismaClient.$disconnect()
  })
