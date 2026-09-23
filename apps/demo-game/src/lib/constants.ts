// Each platform period represents a year in the player timeline.
export const FIRST_GAME_YEAR = new Date().getFullYear()
export const NUM_MONTHS_PER_SEGMENT = 3

export const LEARNING_ACTIVITY_XP = 20
export const INITIAL_CAPITAL = 10000
export const DEFAULT_SEED = 1
export const GAP_STOCKS = 0.025
export const GAP_BONDS = 0.005
export const INTEREST_BANK = 0.002
export const TREND_STOCKS = 0.0065
export const TREND_BONDS = 0.0031

export const LOCATIONS = {
  Trader: ['AG', 'AI', 'BE', 'FR', 'GR', 'JU', 'TI', 'ZH'],
}

export const COLORS = {
  Red: 'bg-orange-200',
  Green: 'bg-lime-200',
  Yellow: 'bg-yellow-200',
  Blue: 'bg-blue-200',
  White: 'bg-white',
}

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const AVATARS = {
  avatar_placeholder: '/avatars/avatar_placeholder.png',
  sparbaer: '/avatars/sparbaer.jpeg',
  sparbulle: '/avatars/sparbulle.jpeg',
  sparfalken: '/avatars/sparfalken.jpeg',
  spargecko: '/avatars/spargecko.jpeg',
  spargeier: '/avatars/spargeier.jpeg',
  sparhai: '/avatars/sparhai.jpeg',
  sparheuschrecke: '/avatars/sparheuschrecke.jpeg',
  sparhund_1: '/avatars/sparhund_1.jpeg',
  sparhund_2: '/avatars/sparhund_2.jpeg',
  sparhund_3: '/avatars/sparhund_3.jpeg',
  sparmaeuse: '/avatars/sparmaeuse.jpeg',
  sparpegasus: '/avatars/sparpegasus.jpeg',
  sparschaf: '/avatars/sparschaf.jpeg',
  sparschwein: '/avatars/sparschwein.jpeg',
}

export const NUM_MONTHS = MONTHS.length

export const cantonNames: Record<string, string> = {
  AG: 'Aargau',
  AI: 'Appenzell Innerrhoden',
  BE: 'Bern',
  FR: 'Fribourg',
  GR: 'Graubünden',
  JU: 'Jura',
  TI: 'Ticino',
  ZH: 'Zürich',
}

export const assetLabels = {
  bank: {
    name: 'Savings',
    risk: 'No risk',
    color: 'bg-player-savings',
    chartColor: 'var(--color-player-savings)',
  },
  bonds: {
    name: 'Bonds',
    risk: 'Some risk',
    color: 'bg-player-bonds',
    chartColor: 'var(--color-player-bonds)',
  },
  stocks: {
    name: 'Stocks',
    risk: 'High risk',
    color: 'bg-player-stocks',
    chartColor: 'var(--color-player-stocks)',
  },
} as const
