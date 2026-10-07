export type ServiceState = 'active' | 'expired' | 'unavailable' | 'tenant_issue'
export interface FailureInput {
  status?: number
  code?: string
  domain?: string
  networkError?: boolean
  timedOut?: boolean
}
export function classifyStatusFailure(f?: FailureInput): 'unavailable' | 'active'
export function failureInputFromError(err: unknown): FailureInput
export function isTenantLookupFailure(f?: FailureInput): boolean
