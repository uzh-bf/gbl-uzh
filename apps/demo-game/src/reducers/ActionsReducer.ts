export enum ActionTypes {}

export function apply(state: any, action: any) {
  console.log('actions', state, action)
  return state
}
