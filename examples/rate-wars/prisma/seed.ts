import { PrismaClient } from '../src/generated/prisma/client'
import prismaClient from '../src/lib/prisma'

const STORY_ELEMENTS = [
  {
    id: 'welcome_bank',
    title: 'Welcome to your bank',
    content: `
You are the management team of a retail bank. Each year you set two numbers:

- **Deposit rate** — what you pay savers. Pay more and deposits flow to you;
  pay less and they flow to your rivals.
- **Loan rate** — what you charge borrowers. Charge less and borrowers pick
  you; charge more and they walk across the street.

Your profit is the **spread** between the two, applied to the volumes you
manage to attract — minus what you lose when borrowers **default**, minus your
fixed operating costs. Money you attract but do not lend is parked at the
central bank and earns the **policy rate**.

One warning: you can only lend what you have (deposits + your own equity), and
some years the economy sours and defaults spike. Lowest equity after the final
year buys the coffee.
`,
  },
]

const LEARNING_ELEMENTS = [
  {
    id: 'net_interest_margin',
    title: 'The Interest Margin',
    question:
      'Your bank raises BOTH its deposit rate and its loan rate by one percentage point. What happens to the interest margin on the business you already have?',
    options: [
      {
        content: 'It doubles — both rates went up.',
        correct: false,
      },
      {
        content:
          'It stays roughly the same — the margin is the DIFFERENCE between the two rates.',
        correct: true,
      },
      {
        content: 'It disappears — higher rates always mean lower profits.',
        correct: false,
      },
    ],
    feedback:
      'The interest margin (spread) is the difference between the loan rate you earn and the deposit rate you pay. Shifting both rates by the same amount leaves the spread unchanged — but it can still change your PROFIT, because rate levels move volumes: a higher deposit rate attracts more deposits (which you must pay interest on), and a higher loan rate scares borrowers away. Profit = spread × volume, and both react to your prices.',
    motivation: 'Understand the engine of every retail bank: the spread.',
    reward: { xp: 50 },
  },
  {
    id: 'credit_risk',
    title: 'Credit Risk',
    question:
      'A recession pushes the default rate from 2% to 6% of all loans. Which bank suffers the most?',
    options: [
      {
        content: 'The bank with the most loans outstanding.',
        correct: true,
      },
      {
        content: 'The bank paying the highest deposit rate.',
        correct: false,
      },
      {
        content: 'The bank with the most money parked at the central bank.',
        correct: false,
      },
    ],
    feedback:
      'Credit losses scale with the loan book: every additional franc lent is a franc exposed to default. The aggressive lender who won the loan market in good years carries the largest absolute losses when defaults spike. Funds parked at the central bank earn less in good times but are safe — this is the risk/return trade-off on the asset side of a bank.',
    motivation: 'Why lending more is not always better.',
    reward: { xp: 50 },
  },
].map((elem) => ({ ...elem, options: { create: elem.options } }))

const LEVELS = [
  {
    index: 0,
    description: 'Teller',
    image: 'levels/0.png',
    requiredXP: 0,
  },
  {
    index: 1,
    description: 'Branch Manager',
    image: 'levels/1.png',
    requiredXP: 100,
  },
  {
    index: 2,
    description: 'Head of Retail',
    image: 'levels/2.png',
    requiredXP: 500,
  },
  {
    index: 3,
    description: 'Chief Financial Officer',
    image: 'levels/3.png',
    requiredXP: 1000,
  },
  {
    index: 4,
    description: 'Bank of the Year',
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

  await Promise.all(
    STORY_ELEMENTS.map((data) =>
      prisma.storyElement.upsert({
        create: data,
        update: data,
        where: { id: data.id },
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
