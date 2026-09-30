import { CubePath } from './index';

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

const client = () => new CubePath({ apiKey: 'test-key', baseURL: 'https://api.test', rateLimit: 1000 });

describe('ObjectStorageService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lists tiers', async () => {
    const calls = mockFetch([]);
    await client().objectStorage.listTiers();
    expect(calls[0]).toMatchObject({ url: 'https://api.test/object-storage/tiers', method: 'GET' });
  });

  it('lists buckets with filters', async () => {
    const calls = mockFetch([]);
    await client().objectStorage.listBuckets({ project_id: 12, tier: 'infrequent_access' });
    expect(calls[0].url).toBe('https://api.test/object-storage/buckets?project_id=12&tier=infrequent_access');
  });

  it('creates, gets, updates and deletes a bucket', async () => {
    const calls = mockFetch({ uuid: 'b1' });
    const os = client().objectStorage;
    await os.createBucket({ name: 'photos', tier: 'infrequent_access', project_id: 12 });
    await os.getBucket('b1');
    await os.updateBucket('b1', { protected: true });
    await os.deleteBucket('b1');
    await os.deleteBucket('b1', { force: true });
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'POST https://api.test/object-storage/buckets',
      'GET https://api.test/object-storage/buckets/b1',
      'PATCH https://api.test/object-storage/buckets/b1',
      'DELETE https://api.test/object-storage/buckets/b1',
      'DELETE https://api.test/object-storage/buckets/b1?force=true',
    ]);
    expect(calls[0].body).toEqual({ name: 'photos', tier: 'infrequent_access', project_id: 12 });
    expect(calls[2].body).toEqual({ protected: true });
  });

  it('creates, lists and deletes access keys', async () => {
    const calls = mockFetch({ uuid: 'k1', secret_access_key: 's' });
    const os = client().objectStorage;
    await os.createKey({ name: 'backups', tier: 'infrequent_access', permission: 'read_only', bucket_uuids: ['b1'] });
    await os.listKeys();
    await os.deleteKey('k1');
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'POST https://api.test/object-storage/keys',
      'GET https://api.test/object-storage/keys',
      'DELETE https://api.test/object-storage/keys/k1',
    ]);
    expect(calls[0].body).toEqual({ name: 'backups', tier: 'infrequent_access', permission: 'read_only', bucket_uuids: ['b1'] });
  });

  it('gets usage for a period', async () => {
    const calls = mockFetch({ tiers: [], buckets: [] });
    await client().objectStorage.getUsage({ period: '2026-09' });
    expect(calls[0].url).toBe('https://api.test/object-storage/usage?period=2026-09');
  });

  it('creates a CDN origin that serves a bucket', async () => {
    const calls = mockFetch({ uuid: 'o1' });
    await client().cdn.createOrigin('z1', { name: 'photos', object_storage_bucket_uuid: 'b1', weight: 100 });
    expect(calls[0]).toMatchObject({ url: 'https://api.test/cdn/zones/z1/origins', method: 'POST' });
    expect(calls[0].body).toEqual({ name: 'photos', object_storage_bucket_uuid: 'b1', weight: 100 });
  });
});
