export enum ActionTypes {
  DECIDE_BANK = 'DECIDE_BANK',
  DECIDE_BONDS = 'DECIDE_BONDS',
  DECIDE_STOCK = 'DECIDE_STOCK',
}

export function apply(state: any, action: any) {
  console.log('actions', state, action)
  return state
}
