import { PrismaClient } from '@prisma/client'

const STORY_ELEMENTS: any[] = [
  {
    id: "story-oil-crisis",
    title: "Global Energy Shock",
    type: "GENERIC",
    content: "Geopolitical tensions in key oil-producing regions have disrupted global crude shipments. Energy prices are skyrocketing worldwide, driving up transportation costs and hitting household budgets. Expect a significant supply-side inflation shock.",
  },
  {
    id: "story-tech-boom",
    title: "The Silicon Valley Leap",
    type: "GENERIC",
    content: "A breakthrough in artificial intelligence and automation has triggered a massive productivity boom across industries. Businesses are reporting significant cost reductions while output increases, creating a positive supply shock.",
  },
  {
    id: "story-supply-chain",
    title: "Global Logistics Gridlock",
    type: "GENERIC",
    content: "Key shipping channels are facing severe congestion due to unexpected trade disputes and extreme weather events. Raw material costs are rising, and delivery times have doubled. This supply chain choke threatens to push production costs up.",
  }
]

const LEARNING_ELEMENTS: any[] = [
  {
    id: "learn-taylor-rule",
    title: "Understanding the Taylor Rule",
    question: "According to the Taylor Rule, if inflation rises above its target by 1%, by how much should a central bank ideally raise its nominal policy rate to ensure real interest rates rise and cool the economy?",
    feedback: "The Taylor Principle states that the nominal rate should be raised by MORE than the increase in inflation (typically 1.5x) to ensure the real interest rate increases and drags aggregate demand down.",
    motivation: "This question tests the player's understanding of the Taylor Principle and nominal vs. real interest rate adjustment dynamics.",
    options: {
      create: [
        { content: "By exactly 1.0%", correct: false, feedback: "Incorrect. Raising by 1.0% keeps the real interest rate constant and fails to cool demand." },
        { content: "By more than 1.0% (e.g., 1.5%)", correct: true, feedback: "Correct! The Taylor Principle mandates a coefficient greater than 1 to adjust real interest rates upward." },
        { content: "By less than 1.0% (e.g., 0.5%)", correct: false, feedback: "Incorrect. This would actually lower the real interest rate, acting as expansionary policy." },
      ]
    }
  },
  {
    id: "learn-supply-shock",
    title: "Navigating Stagflation",
    question: "When an economy is hit by an adverse supply shock (e.g. oil crisis), what dilemma does a central bank with a dual mandate face?",
    feedback: "An adverse supply shock pushes inflation up and GDP growth down (raising unemployment). Tightening policy cools inflation but worsens unemployment; easing policy stimulates growth but worsens inflation. This is the classic stagflation dilemma.",
    motivation: "Tests understanding of supply shocks and the conflicting goals of the dual mandate.",
    options: {
      create: [
        { content: "Both inflation and unemployment fall, making policy choices easy.", correct: false, feedback: "Incorrect. This occurs during positive demand shocks." },
        { content: "Inflation rises while unemployment increases, forcing a trade-off between stabilizing prices vs. jobs.", correct: true, feedback: "Correct! Easing helps employment but fuels inflation; tightening fights inflation but worsens job losses." },
        { content: "Interest rates automatically adjust, requiring no central bank intervention.", correct: false, feedback: "Incorrect. Central bank policy decisions are needed to manage the impacts." },
      ]
    }
  },
  {
    id: "learn-phillips-curve",
    title: "The Phillips Curve Trade-off",
    question: "What does the traditional short-run Phillips Curve imply about the relationship between inflation and unemployment?",
    feedback: "The short-run Phillips Curve shows an inverse (negative) relationship: lowering unemployment requires accepting higher inflation (via demand stimulation), and cooling inflation requires cooling demand, which increases unemployment.",
    motivation: "Reinforces the fundamental trade-off of the central bank's dual mandate.",
    options: {
      create: [
        { content: "Inflation and unemployment are positively correlated.", correct: false, feedback: "Incorrect. They generally move in opposite directions in the short run under demand shocks." },
        { content: "There is an inverse relationship; lower unemployment is associated with higher inflation.", correct: true, feedback: "Correct! Higher demand lowers unemployment but bids prices up." },
        { content: "Unemployment is completely unaffected by inflation in the short run.", correct: false, feedback: "Incorrect. In the short run, wages and prices are sticky, allowing nominal demand shifts to affect employment." },
      ]
    }
  }
]

const LEVELS = [
  {
    index: 0,
    description: 'Novice Governor',
    image: 'levels/0.png',
    requiredXP: 0,
  },
  {
    index: 1,
    description: 'Junior Policymaker',
    image: 'levels/1.png',
    requiredXP: 100,
  },
  {
    index: 2,
    description: 'Stability Expert',
    image: 'levels/2.png',
    requiredXP: 500,
  },
  {
    index: 3,
    description: 'Master of the Mandate',
    image: 'levels/3.png',
    requiredXP: 1000,
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

const prismaClient = new PrismaClient()

main(prismaClient)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prismaClient.$disconnect()
  })
