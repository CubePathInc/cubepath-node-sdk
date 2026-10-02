import { createHmac, timingSafeEqual } from 'crypto';

/** Thrown by verifyStorageEventSignature when a delivery must not be trusted. */
export class StorageEventSignatureError extends Error {
  constructor(message = 'Storage event signature mismatch') {
    super(message);
    this.name = 'StorageEventSignatureError';
  }
}

/**
 * Verifies an Object Storage event webhook delivery.
 *
 * `secret` is the signing secret of the destination, `timestamp` the CubePath-Timestamp header
 * (unix seconds), `body` the raw request body (verify before parsing it) and `header` the
 * CubePath-Signature header: one or more `v1=<hex>` values (several during a secret rotation),
 * each the HMAC-SHA256 of `timestamp + "." + body`. Deliveries whose timestamp is further than
 * `toleranceSeconds` (default 300) from now are rejected; pass 0 to skip that check.
 *
 * Throws StorageEventSignatureError when the delivery is not valid.
 */
export function verifyStorageEventSignature(
  secret: string,
  timestamp: string,
  body: string | Buffer,
  header: string,
  toleranceSeconds = 300,
  now: number = Date.now() / 1000,
): void {
  const ts = timestamp.trim();
  if (!/^\d+$/.test(ts)) throw new StorageEventSignatureError('Invalid timestamp');
  if (toleranceSeconds > 0 && Math.abs(now - Number(ts)) > toleranceSeconds) {
    throw new StorageEventSignatureError('Timestamp outside the tolerance');
  }
  const expected = createHmac('sha256', secret)
    .update(`${ts}.`)
    .update(typeof body === 'string' ? Buffer.from(body, 'utf8') : body)
    .digest();
  for (const part of header.split(/[,\s]+/)) {
    if (!part.startsWith('v1=')) continue;
    const value = part.slice(3);
    if (!/^[0-9a-fA-F]{64}$/.test(value)) continue;
    if (timingSafeEqual(Buffer.from(value, 'hex'), expected)) return;
  }
  throw new StorageEventSignatureError();
}
