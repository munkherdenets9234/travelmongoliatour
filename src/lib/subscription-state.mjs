// Pure parser for the body of GET /subscription-status (already unwrapped from the
// API envelope). Anything that is not exactly {state: 'expired'} counts as active, so
// a malformed or unexpected answer can never put a warning on the site.
export function parseSubscriptionState(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return 'active'
  return body.state === 'expired' ? 'expired' : 'active'
}
