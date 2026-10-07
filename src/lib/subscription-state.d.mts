export type SubscriptionState = 'active' | 'expired'
export function parseSubscriptionState(body: unknown): SubscriptionState
