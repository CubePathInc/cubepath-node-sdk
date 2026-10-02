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

  it('gets, sets and deletes lifecycle rules', async () => {
    const calls = mockFetch({ detail: 'ok', generation: 3 });
    const os = client().objectStorage;
    await os.getBucketLifecycle('b1');
    const rules = [{ id: 'logs-30d', enabled: true, filter: { prefix: 'logs/' }, expiration: { days: 30 } }];
    const change = await os.putBucketLifecycle('b1', rules);
    await os.deleteBucketLifecycle('b1');
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'GET https://api.test/object-storage/buckets/b1/lifecycle',
      'PUT https://api.test/object-storage/buckets/b1/lifecycle',
      'DELETE https://api.test/object-storage/buckets/b1/lifecycle',
    ]);
    expect(calls[1].body).toEqual({ rules });
    expect(change.generation).toBe(3);
  });

  it('creates a bucket with Object Lock and changes its default retention', async () => {
    const calls = mockFetch({ uuid: 'b1', object_lock: { enabled: true, default_retention: null } });
    const os = client().objectStorage;
    await os.createBucket({
      name: 'vault',
      tier: 'infrequent_access',
      object_lock: true,
      object_lock_default: { mode: 'governance', days: 30 },
      accept_object_lock_terms: true,
    });
    await os.setBucketObjectLock('b1', { default_retention: { mode: 'compliance', years: 1 }, accept_object_lock_terms: true });
    await os.setBucketObjectLock('b1', { default_retention: null });
    await os.deleteBucket('b1', { force: true, bypass_governance: true });
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'POST https://api.test/object-storage/buckets',
      'PUT https://api.test/object-storage/buckets/b1/object-lock',
      'PUT https://api.test/object-storage/buckets/b1/object-lock',
      'DELETE https://api.test/object-storage/buckets/b1?force=true&bypass_governance=true',
    ]);
    expect(calls[0].body).toEqual({
      name: 'vault',
      tier: 'infrequent_access',
      object_lock: true,
      object_lock_default: { mode: 'governance', days: 30 },
      accept_object_lock_terms: true,
    });
    expect(calls[1].body).toEqual({ default_retention: { mode: 'compliance', years: 1 }, accept_object_lock_terms: true });
    expect(calls[2].body).toEqual({ default_retention: null });
  });

  it('creates a key with the governance bypass', async () => {
    const calls = mockFetch({ uuid: 'k1', bypass_governance: true });
    const key = await client().objectStorage.createKey({
      name: 'veeam',
      tier: 'infrequent_access',
      permission: 'read_write',
      bypass_governance: true,
    });
    expect(calls[0].body).toEqual({ name: 'veeam', tier: 'infrequent_access', permission: 'read_write', bypass_governance: true });
    expect(key.bypass_governance).toBe(true);
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

  it('lists replications with filters', async () => {
    const calls = mockFetch([]);
    const os = client().objectStorage;
    await os.listReplications();
    await os.listReplications({ direction: 'incoming', bucket_uuid: 'b2' });
    expect(calls.map((c) => c.url)).toEqual([
      'https://api.test/object-storage/replications',
      'https://api.test/object-storage/replications?direction=incoming&bucket_uuid=b2',
    ]);
  });

  it('creates a replication to a CubePath bucket of another organization', async () => {
    const calls = mockFetch({ detail: 'Replication is being configured', uuid: 'r1', status: 'pending' });
    const res = await client().objectStorage.createReplication({
      source_bucket_uuid: 'b1',
      destination: { type: 'cubepath', bucket_uuid: 'b2', grant_token: 'cprg_x' },
      prefix: 'img/',
    });
    expect(calls[0]).toMatchObject({ url: 'https://api.test/object-storage/replications', method: 'POST' });
    expect(calls[0].body).toEqual({
      source_bucket_uuid: 'b1',
      destination: { type: 'cubepath', bucket_uuid: 'b2', grant_token: 'cprg_x' },
      prefix: 'img/',
    });
    expect(res.uuid).toBe('r1');
  });

  it('creates a replication to an external bucket', async () => {
    const calls = mockFetch({ uuid: 'r1', status: 'pending' });
    const destination = {
      type: 'external' as const,
      provider: 'aws' as const,
      endpoint: 's3.eu-west-1.amazonaws.com',
      region: 'eu-west-1',
      bucket: 'acme-backup',
      access_key_id: 'AKIA',
      secret_access_key: 'secret',
    };
    await client().objectStorage.createReplication({ source_bucket_uuid: 'b1', destination, existing_objects: false });
    expect(calls[0].body).toEqual({ source_bucket_uuid: 'b1', destination, existing_objects: false });
  });

  it('gets, updates, resyncs, revokes and deletes a replication', async () => {
    const calls = mockFetch({ detail: 'ok' });
    const os = client().objectStorage;
    await os.getReplication('r1');
    await os.updateReplication('r1', { enabled: false, prefix: null, tags: null });
    await os.updateReplication('r1', { destination: { access_key_id: 'AKIA2', secret_access_key: 's2' } });
    await os.resyncReplication('r1');
    await os.resyncReplication('r1', 7);
    await os.revokeReplication('r1');
    await os.deleteReplication('r1');
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'GET https://api.test/object-storage/replications/r1',
      'PATCH https://api.test/object-storage/replications/r1',
      'PATCH https://api.test/object-storage/replications/r1',
      'POST https://api.test/object-storage/replications/r1/resync',
      'POST https://api.test/object-storage/replications/r1/resync',
      'POST https://api.test/object-storage/replications/r1/revoke',
      'DELETE https://api.test/object-storage/replications/r1',
    ]);
    expect(calls[1].body).toEqual({ enabled: false, prefix: null, tags: null });
    expect(calls[2].body).toEqual({ destination: { access_key_id: 'AKIA2', secret_access_key: 's2' } });
    expect(calls[3].body).toEqual({ older_than_days: null });
    expect(calls[4].body).toEqual({ older_than_days: 7 });
  });

  it('creates, lists and revokes replication grants', async () => {
    const calls = mockFetch({ uuid: 'g1', token: 'cprg_abc', token_prefix: 'cprg_abcd' });
    const os = client().objectStorage;
    const grant = await os.createReplicationGrant('b2', { note: 'for Acme', expires_in_days: 3 });
    await os.createReplicationGrant('b2');
    await os.listReplicationGrants('b2');
    await os.deleteReplicationGrant('g1');
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'POST https://api.test/object-storage/buckets/b2/replication-grants',
      'POST https://api.test/object-storage/buckets/b2/replication-grants',
      'GET https://api.test/object-storage/buckets/b2/replication-grants',
      'DELETE https://api.test/object-storage/replication-grants/g1',
    ]);
    expect(calls[0].body).toEqual({ note: 'for Acme', expires_in_days: 3 });
    expect(calls[1].body).toEqual({});
    expect(grant.token).toBe('cprg_abc');
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

  it('reads the chart series of a bucket through GraphQL', async () => {
    const calls = mockFetch({
      data: {
        objectStorageBucket: {
          uuid: 'b1',
          name: 'photos',
          storageMeasuredAt: 1,
          storage: { start: 1, end: 2, step: 3600, series: [] },
          traffic: { start: 1, end: 2, step: 300, series: [] },
          responses: { start: 1, end: 2, step: 300, series: [] },
        },
      },
    });
    const metrics = await client().objectStorage.getBucketMetrics('b1', 'D7');
    expect(calls[0]).toMatchObject({ url: 'https://api.test/graphql', method: 'POST' });
    expect((calls[0].body as { variables: unknown }).variables).toEqual({ uuid: 'b1', range: 'D7' });
    expect((calls[0].body as { query: string }).query).toContain('objectStorageBucket');
    expect(metrics.storage.step).toBe(3600);
  });

  it('throws 404 for a bucket GraphQL does not find', async () => {
    mockFetch({ data: { objectStorageBucket: null }, errors: [{ message: 'Resource not found.', extensions: { code: 'NOT_FOUND' } }] });
    await expect(client().objectStorage.getBucketMetrics('nope')).rejects.toMatchObject({ statusCode: 404 });
  });
});
