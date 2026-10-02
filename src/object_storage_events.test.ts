import { CubePath, StorageEventSignatureError, verifyStorageEventSignature } from './index';

type Call = { url: string; method: string; body?: unknown };

function mockFetch(responseBody: unknown = {}): Call[] {
  const calls: Call[] = [];
  global.fetch = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: String(url),
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    return new Response(JSON.stringify(responseBody), { status: 200 });
  }) as unknown as typeof fetch;
  return calls;
}

const client = () => new CubePath({ apiKey: 'k', baseURL: 'https://api.test', rateLimit: 1000, maxRetries: 0 });

const SECRET = 'whsec_0123456789abcdefABCDEF0123456789';
const TS = '1790000000';
const BODY = '{"id":"evt_01","type":"object.created"}';
const SIG = '348e719a6c9fb75f1c6a60cc81ec5914a599eb648b1ab9d81e483fc2309c6f3b';
const PREV_SIG = 'd1cc88ad9e8ba98e234697ea257b0969a065c04f879a1c9cdcab90ef316a953d';
const NOW = 1790000000;

describe('Object Storage event notifications', () => {
  afterEach(() => jest.restoreAllMocks());

  it('covers the destination and rule routes', async () => {
    const calls = mockFetch({ destination: { uuid: 'd1' }, signing_secret: 'whsec_x' });
    const os = client().objectStorage;
    const created = await os.createEventDestination({ name: 'hook', type: 'webhook', url: 'https://example.com/h' });
    expect(created.signing_secret).toBe('whsec_x');
    await os.listEventDestinations();
    await os.getEventDestination('d1');
    await os.updateEventDestination('d1', { enabled: false });
    await os.rotateEventDestinationSecret('d1');
    await os.testEventDestination('d1');
    await os.listEventDeliveries('d1', { status: 'failed', limit: 10 });
    await os.deleteEventDestination('d1');
    await os.listEventRules('b1');
    await os.createEventRule('b1', { name: 'r', destination_uuid: 'd1', events: ['object.created'], prefix: 'in/' });
    await os.updateEventRule('b1', 'r1', { enabled: false });
    await os.deleteEventRule('b1', 'r1');
    expect(calls.map((c) => `${c.method} ${c.url.replace('https://api.test', '')}`)).toEqual([
      'POST /object-storage/event-destinations',
      'GET /object-storage/event-destinations',
      'GET /object-storage/event-destinations/d1',
      'PATCH /object-storage/event-destinations/d1',
      'POST /object-storage/event-destinations/d1/rotate-secret',
      'POST /object-storage/event-destinations/d1/test',
      'GET /object-storage/event-destinations/d1/deliveries?status=failed&limit=10',
      'DELETE /object-storage/event-destinations/d1',
      'GET /object-storage/buckets/b1/event-rules',
      'POST /object-storage/buckets/b1/event-rules',
      'PATCH /object-storage/buckets/b1/event-rules/r1',
      'DELETE /object-storage/buckets/b1/event-rules/r1',
    ]);
    expect(calls[0].body).toEqual({ name: 'hook', type: 'webhook', url: 'https://example.com/h' });
    expect(calls[9].body).toEqual({ name: 'r', destination_uuid: 'd1', events: ['object.created'], prefix: 'in/' });
  });

  it('verifies signatures with the fixed vectors', () => {
    expect(() => verifyStorageEventSignature(SECRET, TS, BODY, `v1=${SIG}`, 300, NOW)).not.toThrow();
    expect(() => verifyStorageEventSignature(SECRET, TS, Buffer.from(BODY), `v1=${PREV_SIG},v1=${SIG}`, 300, NOW)).not.toThrow();
    expect(() => verifyStorageEventSignature('whsec_previous', TS, BODY, `v1=${SIG}, v1=${PREV_SIG}`, 300, NOW)).not.toThrow();
  });

  it.each([
    ['tampered body', SECRET, TS, '{"id":"evt_02"}', `v1=${SIG}`, NOW],
    ['wrong secret', SECRET, TS, BODY, `v1=${PREV_SIG}`, NOW],
    ['unknown scheme', SECRET, TS, BODY, `v0=${SIG}`, NOW],
    ['expired', SECRET, TS, BODY, `v1=${SIG}`, NOW + 360],
    ['future', SECRET, TS, BODY, `v1=${SIG}`, NOW - 360],
    ['bad timestamp', SECRET, 'abc', BODY, `v1=${SIG}`, NOW],
    ['empty header', SECRET, TS, BODY, '', NOW],
    ['short value', SECRET, TS, BODY, 'v1=abcd', NOW],
  ])('rejects %s', (_name, secret, ts, body, header, now) => {
    expect(() => verifyStorageEventSignature(secret, ts, body, header, 300, now)).toThrow(StorageEventSignatureError);
  });

  it('skips the timestamp check with tolerance 0 and uses the clock by default', () => {
    expect(() => verifyStorageEventSignature(SECRET, TS, BODY, `v1=${SIG}`, 0, NOW + 3600)).not.toThrow();
    expect(() => verifyStorageEventSignature(SECRET, TS, BODY, `v1=${SIG}`)).toThrow(StorageEventSignatureError);
  });
});
