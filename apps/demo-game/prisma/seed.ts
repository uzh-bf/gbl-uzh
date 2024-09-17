import { PrismaClient } from '@prisma/client'

const LEARNING_ELEMENTS = [
  {
    id: 'anleihen_intro',
    title: 'Obligationen',
    question: 'Welche Aussage zum Thema Anleihen (Obligationen) ist korrekt?',
    options: [
      {
        content:
          'Eine Anleihe ist ein Eigenkapitalinstrument, welches von Geldgebern gekauft wird.',
        correct: false,
      },
      {
        content:
          'Eine Anleihe beinhaltet ein geringeres erwartetes Risiko als eine Aktie.',
        correct: true,
      },
      {
        content:
          'Anleihen werden stets von Unternehmen als Finanzierungsquelle ausgegeben.',
        correct: false,
      },
    ],
    feedback: `Die Anleihe ist eine Finanzierungsquelle für Unternehmen und den Staat, entspricht einem Forderungspapier und zählt zum Fremdkapital. Das Unternehmen (Emittent) gibt eine Anleihe aus (Emission), welche von den Geldgebern gekauft wird. Beispiele sind die amerikanischen Treasury Bonds (T-Bonds) oder die Schweizer Staatsanleihen (Eidgenossen). Beim Kauf von Anleihen werden die Geldgeber dabei nicht wie beim Kauf von Aktien zu Mitinhabern des Unternehmens, sondern fungieren lediglich als Fremdkapitalgeber (Gläubiger). Daher werden die Inhaber einer Anleihe anders als die Eigenkapitalgeber (Aktionäre) mit einem – meist fixem – Zins vergütet. Dies mindert aus Sicht des Anlegers im Vergleich zum Aktienkauf das Risiko, weil allfällige Verluste nicht, beziehungsweise erst bei sehr schlechtem Geschäftsgang mitgetragen werden. Das tiefere Risiko führt zu einer geringeren erwarteten Rendite, welche aufgrund der häufig fixen Zinsen auch in der Höhe begrenzt ist.`,
    motivation: 'TBD',
  },
  {
    id: 'aktien_intro',
    title: 'Aktien',
    question: 'Welche Aussage zum Thema Aktien ist korrekt?',
    options: [
      {
        content:
          'Die Aktionäre tragen das volle unternehmerische Risiko eines Unternehmens.',
        correct: true,
      },
      {
        content:
          'Aktien haben eine begrenzte Laufzeit und werden danach dem Emittent zurückgegeben.',
        correct: false,
      },
      {
        content:
          'Mit dem Erwerb von Aktien wird der Aktionär zum Gläubiger der Aktiengesellschaft.',
        correct: false,
      },
    ],
    feedback:
      'Mit dem Erwerb von Aktien (Beteiligungspapiere) wird ein Kapitalgeber zum Mitinhaber der Aktiengesellschaft. Aktien haben keine begrenzte Laufzeit, da sie einen Besitzanteil verkörpern und kein Schuldverhältnis. Als Mitinhaberin der Aktiengesellschaft erhält eine Aktionärin zum einen Mitgliedsrechte und zum anderen Vermögensrechte. Mitgliedsrechte beinhalten das Recht an der Generalversammlung teilzunehmen, Stimm- und Wahlrechte an der Generalversammlung sowie Informations- und Kontrollrechte. Vermögensrechte sprechen jeder Aktionärin einen verhältnismässigen Anteil am Unternehmensgewinn zu. Diese Entschädigung geschieht oft in Form einer Dividende. Die Dividende kann auf verschiedene Arten ausgeschüttet werden. Unterschieden wird dabei zwischen Bardividende und Naturaldividende. Da die Aktionäre die Inhaber der Aktiengesellschaft sind, zählt das Aktienkapital aus Sicht der Unternehmung zum Eigenkapital, wie in Abbildung 2 ersichtlich wird. Dadurch tragen die Aktionäre das volle unternehmerische Risiko, wobei sie von Gewinnen profitieren, aber auch dem Risiko von Verlusten ausgesetzt sind.',
    motivation: 'TBD',
  },
  {
    id: 'investitions_risiken',
    title: 'Investitionsrisiken',
    question:
      'Welche Aussage zum Thema Investitionsrisiken bei Finanzanlagen ist korrekt?',
    options: [
      {
        content:
          'Das Marktrisiko bezeichnet das Risiko, welches aufgrund des Ausfalls eines Emittenten entsteht.',
        correct: false,
      },
      {
        content:
          'Als Liquiditätsrisiko wird das Risiko bezeichnet, welches aufgrund der Erhöhung des allgemeinen Güterpreisniveaus entsteht.',
        correct: false,
      },
      {
        content:
          'Das Investitionsrisiko bezeichnet die Unsicherheit bezüglich der Vorteilhaftigkeit einer Investition.',
        correct: true,
      },
    ],
    feedback: `Eine Investition sowohl in eine Finanzanlage als auch in einen Sachwert ist stets mit Risiken, also der Unsicherheit bezüglich der Vorteilhaftigkeit einer Investition verbunden. Das Investitionsrisiko setzt sich aus unterschiedlichen, folgend beschriebenen Komponenten zusammen:
-	Marktrisiko oder Marktpreisänderungsrisiko: Risiko, welches aufgrund von Marktpreisänderungen (z.B. Zinsen oder Wechselkurse) entsteht.
-	Liquiditätsrisiko oder Zahlungsunfähigkeitsrisiko: Risiko, dass nicht genügend liquide Mittel zur Verfügung stehen oder zu überhöhten Kosten beschafft werden müssen, um Zahlungsverpflichtungen nachzukommen.
-	Ausfallsrisiko: Risiko, welches aufgrund eines Ausfalls (Konkurs) eines Emittenten entsteht.
-	Inflationsrisiko: Risiko, dass durch die Erhöhung des allgemeinen Güterpreisniveaus die Kaufkraft des Geldes gemindert wird.
-	Industrierisiko oder Branchenrisiko: Risiko, welches durch branchenspezifische Einflussfaktoren wie Konjunktursensitivität, Wachstumsmöglichkeiten oder technologischer Entwicklungsstand entsteht.`,
    motivation: 'TBD',
  },
  {
    id: 'time_value_of_money',
    title: 'Time Value of Money (Zeitwert des Geldes)',
    question:
      'Nehmen Sie an, dass Sie sich in einem Umfeld mit positiven Zinsen befinden. Welche Implikation hat das Konzept Time Value of Money?',
    options: [
      {
        content:
          'Ein erhaltener Franken morgen ist mehr Wert als ein erhaltener Franken heute.',
        correct: false,
      },
      {
        content:
          'Ein erhaltener Franken morgen ist gleich viel Wert wie ein erhaltener Franken heute.',
        correct: false,
      },
      {
        content:
          'Ein erhaltener Franken heute ist mehr Wert als ein erhaltener Franken morgen.',
        correct: true,
      },
    ],
    feedback: `Sowohl Finanzierungs- als auch Investitionsentscheidungen beinhalten Ein- und Auszahlungen, die über die Zeit verteilt sind. Entscheidungsträger in Haushalten, Unternehmungen und Regierungen müssen evaluieren, ob heutige Mittelabflüsse durch die erwarteten Rückflüsse in der Zukunft gerechtfertigt sind. Sie müssen demnach den Wert von Geldbeträgen, welche zu unterschiedlichen Zeitpunkten anfallen, miteinander vergleichen können. Deshalb werden alle zukünftigen Geldbeträge auf einen Zeitpunkt (z.B. heute oder in drei Jahren) hin bewertet.
Dies zu tun erfordert ein grundlegendes Verständnis für den Zeitwert des Geldes (Time Value of Money), respektive die Kenntnis der zugrundeliegenden Konzepte und Techniken. Der "Time Value of Money“ beschreibt die Tatsache, dass Geld heute mehr Wert ist als Geld, das man erst morgen erhält:
-	Man kann das Geld heute anlegen oder investieren und damit Zinsen oder einen an-deren Ertrag (Dividenden, Kurssteigerungen, Mietzins etc.) erzielen. Deshalb wird man in Zukunft mehr Geld zur Verfügung haben.
-	In Zukunft erwartete Geldflüsse sind in der Regel mit Unsicherheit behaftet, d.h. eine Zahlung kann höher oder tiefer als erwartet ausfallen oder im schlimmsten Fall gar nicht erfolgen.
-	Die Inflation kann die Kaufkraft des Geldes über die Zeit mindern. `,
    motivation: 'TBD',
  },
].map((elem) => ({ ...elem, options: { create: elem.options } }))

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
