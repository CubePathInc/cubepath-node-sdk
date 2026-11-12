const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A baremetal reference: the server uuid, which is also its `id`. */
export type BaremetalRef = string;

/**
 * Validate a baremetal reference (a uuid 8-4-4-4-12, any case) and return it in lower case.
 * Anything else, a server number included, throws before any request is made.
 */
export function baremetalRef(ref: BaremetalRef): string {
  if (typeof ref === 'string' && UUID_RE.test(ref)) return ref.toLowerCase();
  throw new Error(`Invalid baremetal reference ${JSON.stringify(ref)}: baremetal reference must be a uuid`);
}

/**
 * Validate the target of a route, BGP peer, load balancer target or alert when it names a
 * baremetal server (a uuid, returned in lower case). Targets of other types are returned as given.
 */
export function baremetalTarget(targetType: string | undefined, target: string): string {
  return targetType === 'baremetal' ? baremetalRef(target) : target;
}

/** Whether a server of a listing is the one the (already validated) reference names. */
export function baremetalMatches(bm: { id?: string }, ref: string): boolean {
  return typeof bm.id === 'string' && bm.id.toLowerCase() === ref;
}
