// Original database text used by the seed and by existing installations.
export const stories = {
  bank_account: {
    title: 'A. About the Savings Account',
    content:
      '\nA bank account represents the safest way to store your money. Your deposits are protected by government guarantees, and you earn a predictable, though modest, interest rate. Think of it as the foundation of your financial journey - not the most exciting investment, but a reliable starting point that provides easy access to your money while keeping it secure.\n![](/images/robot_savings.jpg)\n',
  },
  bonds: {
    title: 'B. About Bonds',
    content:
      "\nWhen you invest in bonds, you're essentially becoming a lender to governments or companies. It's like making a deal: you provide them with money now, and they promise to pay you regular interest payments plus return your initial investment when the bond matures. While bonds typically offer higher returns than savings accounts, they come with their own risks. Their value can fluctuate based on interest rate changes in the economy, and there's always the possibility, though rare, that the borrower might fail to meet their obligations. The simulation combines both interest payments and price changes to show you the complete picture of bond investment returns.\n![](/images/robot_bonds.jpg)\n",
  },
  stocks: {
    title: 'C. About Stocks',
    content:
      "\nInvesting in stocks means becoming a partial owner of real companies. When you buy shares, you're not just purchasing a trading instrument - you're acquiring a slice of a business's future success or failure. While stocks typically offer the highest potential returns among these three options, they also come with the most dramatic price swings. Your returns come from both company profits paid as dividends and changes in the stock's market value. The simulation combines these elements to demonstrate how stock investments perform over time, including both the thrilling ups and challenging downs of market movements.\n![](/images/robot_stocks.jpg)\n",
  },
  diversification: {
    title: 'E. The Power of Diversification',
    content:
      '\nDiversification is like not putting all your eggs in one basket. By spreading your money across different investments, you can reduce your risk without necessarily sacrificing returns. When you invest in multiple asset classes - like combining savings, bonds, and stocks - you create a balanced portfolio where the strength of one investment can help offset temporary weaknesses in others. Think of it as building a team where each player has different strengths: your savings provide stability, bonds offer steady income, and stocks give you growth potential. The simulation will show you how different combinations of these investments perform over time.\n![](/images/robot_diversification.jpg)\n',
  },
  volatility_risk: {
    title: 'D. Understanding Volatility and Risk',
    content:
      "\nVolatility represents how much and how quickly investment values change over time. Think of it like waves in the ocean - some investments have gentle ripples (low volatility), while others have large waves (high volatility). In our simulation, you'll see this clearly in how different investments behave:\n\n- Savings accounts are like a calm pond - minimal waves but also minimal growth. They offer the lowest volatility with predictable, though small, returns.\n- Bonds create moderate ripples - they move up and down more than savings accounts but less dramatically than stocks. Their movements are often tied to interest rates and economic conditions.\n- Stocks are like ocean waves - they can rise high and fall low, sometimes quite dramatically. This higher volatility comes with the potential for greater returns, but also bigger risks. When markets become more volatile, your stock investments might swing up or down by significant percentages.\n\nRemember: Higher potential returns typically come with higher volatility. This isn't necessarily bad - it creates opportunities for patient investors who understand and can tolerate these movements in pursuit of their long-term goals.\n",
  },
}
export const lessons = [
  {
    id: 'bonds_intro',
    title: 'Bonds',
    question: 'Welche Aussage zum Thema Anleihen (Obligationen) ist korrekt?',
    feedback:
      'Die Anleihe ist eine Finanzierungsquelle für Unternehmen und den Staat, entspricht einem Forderungspapier und zählt zum Fremdkapital. Das Unternehmen (Emittent) gibt eine Anleihe aus (Emission), welche von den Geldgebern gekauft wird. Beispiele sind die amerikanischen Treasury Bonds (T-Bonds) oder die Schweizer Staatsanleihen (Eidgenossen). Beim Kauf von Anleihen werden die Geldgeber dabei nicht wie beim Kauf von Aktien zu Mitinhabern des Unternehmens, sondern fungieren lediglich als Fremdkapitalgeber (Gläubiger). Daher werden die Inhaber einer Anleihe anders als die Eigenkapitalgeber (Aktionäre) mit einem – meist fixem – Zins vergütet. Dies mindert aus Sicht des Anlegers im Vergleich zum Aktienkauf das Risiko, weil allfällige Verluste nicht, beziehungsweise erst bei sehr schlechtem Geschäftsgang mitgetragen werden. Das tiefere Risiko führt zu einer geringeren erwarteten Rendite, welche aufgrund der häufig fixen Zinsen auch in der Höhe begrenzt ist.',
    motivation: 'TBD',
    options: [
      'Eine Anleihe ist ein Eigenkapitalinstrument, welches von Geldgebern gekauft wird.',
      'Eine Anleihe beinhaltet ein geringeres erwartetes Risiko als eine Aktie.',
      'Anleihen werden stets von Unternehmen als Finanzierungsquelle ausgegeben.',
    ],
  },
  {
    id: 'stocks_intro',
    title: 'Stocks',
    question: 'Welche Aussage zum Thema Aktien ist korrekt?',
    feedback:
      'Mit dem Erwerb von Aktien (Beteiligungspapiere) wird ein Kapitalgeber zum Mitinhaber der Aktiengesellschaft. Aktien haben keine begrenzte Laufzeit, da sie einen Besitzanteil verkörpern und kein Schuldverhältnis. Als Mitinhaberin der Aktiengesellschaft erhält eine Aktionärin zum einen Mitgliedsrechte und zum anderen Vermögensrechte. Mitgliedsrechte beinhalten das Recht an der Generalversammlung teilzunehmen, Stimm- und Wahlrechte an der Generalversammlung sowie Informations- und Kontrollrechte. Vermögensrechte sprechen jeder Aktionärin einen verhältnismässigen Anteil am Unternehmensgewinn zu. Diese Entschädigung geschieht oft in Form einer Dividende. Die Dividende kann auf verschiedene Arten ausgeschüttet werden. Unterschieden wird dabei zwischen Bardividende und Naturaldividende. Da die Aktionäre die Inhaber der Aktiengesellschaft sind, zählt das Aktienkapital aus Sicht der Unternehmung zum Eigenkapital, wie in Abbildung 2 ersichtlich wird. Dadurch tragen die Aktionäre das volle unternehmerische Risiko, wobei sie von Gewinnen profitieren, aber auch dem Risiko von Verlusten ausgesetzt sind.',
    motivation: 'TBD',
    options: [
      'Die Aktionäre tragen das volle unternehmerische Risiko eines Unternehmens.',
      'Aktien haben eine begrenzte Laufzeit und werden danach dem Emittent zurückgegeben.',
      'Mit dem Erwerb von Aktien wird der Aktionär zum Gläubiger der Aktiengesellschaft.',
    ],
  },
  {
    id: 'investments_risks',
    title: 'Investment Risks',
    question:
      'Welche Aussage zum Thema Investitionsrisiken bei Finanzanlagen ist korrekt?',
    feedback:
      'Eine Investition sowohl in eine Finanzanlage als auch in einen Sachwert ist stets mit Risiken, also der Unsicherheit bezüglich der Vorteilhaftigkeit einer Investition verbunden. Das Investitionsrisiko setzt sich aus unterschiedlichen, folgend beschriebenen Komponenten zusammen:\n-\tMarktrisiko oder Marktpreisänderungsrisiko: Risiko, welches aufgrund von Marktpreisänderungen (z.B. Zinsen oder Wechselkurse) entsteht.\n-\tLiquiditätsrisiko oder Zahlungsunfähigkeitsrisiko: Risiko, dass nicht genügend liquide Mittel zur Verfügung stehen oder zu überhöhten Kosten beschafft werden müssen, um Zahlungsverpflichtungen nachzukommen.\n-\tAusfallsrisiko: Risiko, welches aufgrund eines Ausfalls (Konkurs) eines Emittenten entsteht.\n-\tInflationsrisiko: Risiko, dass durch die Erhöhung des allgemeinen Güterpreisniveaus die Kaufkraft des Geldes gemindert wird.\n-\tIndustrierisiko oder Branchenrisiko: Risiko, welches durch branchenspezifische Einflussfaktoren wie Konjunktursensitivität, Wachstumsmöglichkeiten oder technologischer Entwicklungsstand entsteht.',
    motivation: 'TBD',
    options: [
      'Das Marktrisiko bezeichnet das Risiko, welches aufgrund des Ausfalls eines Emittenten entsteht.',
      'Als Liquiditätsrisiko wird das Risiko bezeichnet, welches aufgrund der Erhöhung des allgemeinen Güterpreisniveaus entsteht.',
      'Das Investitionsrisiko bezeichnet die Unsicherheit bezüglich der Vorteilhaftigkeit einer Investition.',
    ],
  },
  {
    id: 'time_value_of_money',
    title: 'Time Value of Money (Zeitwert des Geldes)',
    question:
      'Nehmen Sie an, dass Sie sich in einem Umfeld mit positiven Zinsen befinden. Welche Implikation hat das Konzept Time Value of Money?',
    feedback:
      'Sowohl Finanzierungs- als auch Investitionsentscheidungen beinhalten Ein- und Auszahlungen, die über die Zeit verteilt sind. Entscheidungsträger in Haushalten, Unternehmungen und Regierungen müssen evaluieren, ob heutige Mittelabflüsse durch die erwarteten Rückflüsse in der Zukunft gerechtfertigt sind. Sie müssen demnach den Wert von Geldbeträgen, welche zu unterschiedlichen Zeitpunkten anfallen, miteinander vergleichen können. Deshalb werden alle zukünftigen Geldbeträge auf einen Zeitpunkt (z.B. heute oder in drei Jahren) hin bewertet.\nDies zu tun erfordert ein grundlegendes Verständnis für den Zeitwert des Geldes (Time Value of Money), respektive die Kenntnis der zugrundeliegenden Konzepte und Techniken. Der "Time Value of Money“ beschreibt die Tatsache, dass Geld heute mehr Wert ist als Geld, das man erst morgen erhält:\n-\tMan kann das Geld heute anlegen oder investieren und damit Zinsen oder einen anderen Ertrag (Dividenden, Kurssteigerungen, Mietzins etc.) erzielen. Deshalb wird man in Zukunft mehr Geld zur Verfügung haben.\n-\tIn Zukunft erwartete Geldflüsse sind in der Regel mit Unsicherheit behaftet, d.h. eine Zahlung kann höher oder tiefer als erwartet ausfallen oder im schlimmsten Fall gar nicht erfolgen.\n-\tDie Inflation kann die Kaufkraft des Geldes über die Zeit mindern. ',
    motivation: 'TBD',
    options: [
      'Ein erhaltener Franken morgen ist mehr Wert als ein erhaltener Franken heute.',
      'Ein erhaltener Franken morgen ist gleich viel Wert wie ein erhaltener Franken heute.',
      'Ein erhaltener Franken heute ist mehr Wert als ein erhaltener Franken morgen.',
    ],
  },
]
export const levels = [
  {
    index: 0,
    description: 'Hello, World',
  },
  {
    index: 1,
    description: 'Starting Out',
  },
  {
    index: 2,
    description: 'Levelling Up',
  },
  {
    index: 3,
    description: 'Advancing Further',
  },
  {
    index: 4,
    description: 'Achieving Mastery',
  },
]
