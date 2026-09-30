import { CubePath } from './index';

type Call = { url: string; method: string; body?: any };

function mockFetch(...responses: unknown[]): Call[] {
  const calls: Call[] = [];
  let i = 0;
  global.fetch = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: String(url),
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    const body = responses[Math.min(i++, responses.length - 1)];
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  return calls;
}

const client = () => new CubePath({ apiKey: 'k', baseURL: 'https://api.test', rateLimit: 1000, maxRetries: 0 });

describe('stale endpoint fixes', () => {
  afterEach(() => jest.restoreAllMocks());

  it('attaches firewall groups with PUT /firewall/vps/{id}/groups', async () => {
    const calls = mockFetch({ detail: 'ok', vps_id: 7, firewall_groups: [3], sync_task_created: true });
    const res = await client().firewall.assignToVPS('7', { firewall_group_ids: ['3'] } as any);
    expect(calls[0]).toMatchObject({ url: 'https://api.test/firewall/vps/7/groups', method: 'PUT' });
    expect(res.detail).toBe('ok');
  });

  it('creates a firewall group with project_id in the query, not the body', async () => {
    const calls = mockFetch({ id: 5, name: 'web' });
    await client().firewall.create({ project_id: 12, name: 'web', rules: [], enabled: true });
    expect(calls[0]).toMatchObject({ url: 'https://api.test/firewall/groups?project_id=12', method: 'POST' });
    expect(calls[0].body).not.toHaveProperty('project_id');
  });

  it('updates a firewall group with PUT and gets it from the list', async () => {
    const calls = mockFetch({ id: 5, name: 'new' }, [{ id: 4, name: 'a' }, { id: 5, name: 'b' }]);
    const fw = client().firewall;
    await fw.update('5', { name: 'new' });
    const g = await fw.get('5');
    expect(calls[0]).toMatchObject({ url: 'https://api.test/firewall/groups/5', method: 'PUT' });
    expect(calls[1]).toMatchObject({ url: 'https://api.test/firewall/groups', method: 'GET' });
    expect(g.name).toBe('b');
    await expect(fw.get('99')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('gets a load balancer from the list', async () => {
    const calls = mockFetch([{ uuid: 'a', name: 'x' }, { uuid: 'b', name: 'y' }]);
    const lb = await client().loadBalancer.get('b');
    expect(calls[0].url).toBe('https://api.test/loadbalancer/');
    expect(lb.name).toBe('y');
  });

  it('reads NAT metrics and bandwidth usage from GraphQL', async () => {
    const calls = mockFetch(
      { data: { natGateway: { metrics: { start: 1, end: 2, step: 30, series: [] } } } },
      { data: { natGateway: { bandwidthUsage: { inBytes: 1, outBytes: 2, totalBytes: 3, periodStart: 0, periodEnd: 1 } } } },
    );
    const nat = client().natGateway;
    const m = await nat.getMetrics('u1', 'H24');
    const b = await nat.getBandwidthUsage('u1');
    expect(calls[0]).toMatchObject({ url: 'https://api.test/graphql', method: 'POST' });
    expect(calls[0].body.variables).toEqual({ uuid: 'u1', range: 'H24' });
    expect(m.step).toBe(30);
    expect(b.totalBytes).toBe(3);
  });

  it('maps a GraphQL NOT_FOUND to a 404 CubePathError', async () => {
    mockFetch({ data: { natGateway: null }, errors: [{ message: 'Resource not found.', extensions: { code: 'NOT_FOUND' } }] });
    await expect(client().natGateway.getMetrics('nope')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('reads BMC sensors from GraphQL', async () => {
    const calls = mockFetch({
      data: { baremetal: { sensors: { ipmiAvailable: true, powerOn: true, lastSeen: 100, temperatures: [{ name: 'CPU', value: 41, unit: 'CELSIUS' }], fans: [] } } },
    });
    const s = await client().baremetal.bmcSensors('9');
    expect(calls[0].body.variables).toEqual({ id: '9' });
    expect(s.ipmi_available).toBe(true);
    expect(s.last_seen).toBe(100);
    expect(s.sensors.temperatures[0].unit).toBe('CELSIUS');
  });

  it('derives reinstall status from the server status and cancels with DELETE', async () => {
    const calls = mockFetch([{ project: {}, baremetals: [{ id: '9', status: 'deploying' }] }], {});
    const bm = client().baremetal;
    const st = await bm.reinstallStatus('9');
    await bm.cancelReinstall('9');
    expect(st.is_reinstalling).toBe(true);
    expect(calls[1]).toMatchObject({ url: 'https://api.test/baremetal/9/reinstall', method: 'DELETE' });
  });
});
