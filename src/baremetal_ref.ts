const NUMBER_RE = /^\d+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A baremetal reference as the caller may give it: the server number or its uuid. */
export type BaremetalRef = string | number;

/**
 * Validate a baremetal reference (digits only, or a uuid 8-4-4-4-12) and return the text
 * to put in the URL: the number as given, the uuid in lower case. Anything else throws
 * before any request is made.
 */
export function baremetalRef(ref: BaremetalRef): string {
  const text = typeof ref === 'number' ? (Number.isSafeInteger(ref) && ref >= 0 ? String(ref) : '') : String(ref ?? '');
  if (NUMBER_RE.test(text)) return text;
  if (UUID_RE.test(text)) return text.toLowerCase();
  throw new Error(`Invalid baremetal reference ${JSON.stringify(ref)}: expected the server number or its uuid`);
}

/** Whether a server of a listing is the one the (already validated) reference names. */
export function baremetalMatches(bm: { id?: string | number; uuid?: string }, ref: string): boolean {
  if (bm.id !== undefined && bm.id !== null && String(bm.id) === ref) return true;
  return typeof bm.uuid === 'string' && bm.uuid !== '' && bm.uuid.toLowerCase() === ref;
}
