import { CubePath } from './index';

const UUID = '0b9f6a3e-1c2d-4e5f-8a7b-9c0d1e2f3a4b';
const OTHER = 'aaaaaaaa-0000-4000-8000-000000000000';

function mockProjects(projects: unknown): void {
  global.fetch = jest.fn(async () => new Response(JSON.stringify(projects), { status: 200 })) as unknown as typeof fetch;
}

const client = () => new CubePath({ apiKey: 'test-key', baseURL: 'https://api.test', rateLimit: 1000 });

describe('BaremetalService.get', () => {
  afterEach(() => jest.restoreAllMocks());

  it('finds a server by its uuid, in any case', async () => {
    mockProjects([{ baremetals: [{ id: OTHER, uuid: OTHER, hostname: 'a' }, { id: UUID, uuid: UUID, hostname: 'b' }] }]);
    expect((await client().baremetal.get(UUID)).hostname).toBe('b');
    expect((await client().baremetal.get(UUID.toUpperCase())).hostname).toBe('b');
  });

  it('fails with not found for an unknown uuid', async () => {
    mockProjects([{ baremetals: [{ id: OTHER, uuid: OTHER, hostname: 'a' }] }]);
    await expect(client().baremetal.get(UUID)).rejects.toThrow(`Baremetal ${UUID} not found`);
  });
});

describe('baremetal reference validation', () => {
  const calls: Array<{ url: string; body?: string }> = [];
  beforeEach(() => {
    calls.length = 0;
    global.fetch = jest.fn(async (url: unknown, init?: RequestInit) => {
      calls.push({ url: String(url), body: init?.body ? String(init.body) : undefined });
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;
  });
  afterEach(() => jest.restoreAllMocks());

  it('sends the uuid in lower case', async () => {
    await client().baremetal.kvm(UUID.toUpperCase());
    await client().baremetal.power(UUID, 'restart_metal');
    await client().baremetal.listOS(UUID);
    await client().baremetal.ipmiSession(UUID);
    await client().floatingIPs.assign('baremetal', UUID.toUpperCase(), '1.2.3.4');
    await client().floatingIPs.assign('vps', '12', '1.2.3.4');
    expect(calls.map((c) => c.url)).toEqual([
      `https://api.test/baremetal/${UUID}/kvm`,
      `https://api.test/baremetal/${UUID}/power/restart_metal`,
      `https://api.test/baremetal/os/${UUID}`,
      `https://api.test/ipmi-proxy/create-session/${UUID}`,
      `https://api.test/floating_ips/assign/baremetal/${UUID}?address=1.2.3.4`,
      'https://api.test/floating_ips/assign/vps/12?address=1.2.3.4',
    ]);
  });

  it.each(['', '9', '007', 'abc', '5/../x', '-1', '0b9f6a3e1c2d4e5f8a7b9c0d1e2f3a4b', `${UUID}x`, ` ${UUID}`])(
    'rejects %j before any request',
    async (bad) => {
      const bm = client().baremetal;
      await expect(bm.kvm(bad)).rejects.toThrow('baremetal reference must be a uuid');
      await expect(bm.get(bad)).rejects.toThrow('baremetal reference must be a uuid');
      await expect(bm.bmcSensors(bad)).rejects.toThrow('baremetal reference must be a uuid');
      await expect(bm.reinstallStatus(bad)).rejects.toThrow('baremetal reference must be a uuid');
      await expect(client().floatingIPs.assign('baremetal', bad, '1.2.3.4')).rejects.toThrow('must be a uuid');
      expect(calls).toEqual([]);
    },
  );

  it('rejects a number passed from untyped code', async () => {
    await expect(client().baremetal.kvm(9 as unknown as string)).rejects.toThrow('baremetal reference must be a uuid');
    expect(calls).toEqual([]);
  });

  it('sends the uuid to GraphQL, without resolving anything first', async () => {
    const bodies: string[] = [];
    global.fetch = jest.fn(async (_u: unknown, init?: RequestInit) => {
      bodies.push(String(init?.body));
      return new Response(JSON.stringify({ data: { baremetal: { sensors: { temperatures: [], fans: [] } } } }), { status: 200 });
    }) as unknown as typeof fetch;
    await client().baremetal.bmcSensors(UUID.toUpperCase());
    expect(bodies).toHaveLength(1);
    expect(JSON.parse(bodies[0]).variables).toEqual({ id: UUID });
  });

  it('takes the uuid as the baremetal target of routes, BGP peers, load balancers and alerts', async () => {
    const c = client();
    const upper = UUID.toUpperCase();
    await c.networks.createRoute(5, { destination: '10.1.0.0/24', next_hop_type: 'baremetal', next_hop_target: upper });
    await c.networks.createBGPPeer(5, { peer_type: 'baremetal', peer_target: upper, remote_asn: 65001 });
    await c.loadBalancer.addTarget('lb', 'l', { target_type: 'baremetal', target_uuid: upper, weight: 100 });
    await c.loadBalancer.addTargets('lb', 'l', [{ target_type: 'vps', target_uuid: '7' }]);
    await c.cloudAlerts.create({
      project_id: 1, name: 'a', target_type: 'baremetal', target_id: upper,
      metric_type: 'network_in', operator: 'gt', threshold: 1, actions: [],
    });
    const bodies = calls.map((x) => JSON.parse(x.body ?? '{}'));
    expect(bodies[0].next_hop_target).toBe(UUID);
    expect(bodies[1].peer_target).toBe(UUID);
    expect(bodies[2].target_uuid).toBe(UUID);
    expect(bodies[3].targets[0].target_uuid).toBe('7');
    expect(bodies[4].target_id).toBe(UUID);

    calls.length = 0;
    await expect(c.networks.createRoute(5, { destination: '10.1.0.0/24', next_hop_type: 'baremetal', next_hop_target: '12' })).rejects.toThrow('must be a uuid');
    await expect(c.networks.createBGPPeer(5, { peer_type: 'baremetal', peer_target: '12', remote_asn: 65001 })).rejects.toThrow('must be a uuid');
    await expect(c.loadBalancer.addTarget('lb', 'l', { target_type: 'baremetal', target_uuid: '12', weight: 100 })).rejects.toThrow('must be a uuid');
    await expect(c.loadBalancer.addTargets('lb', 'l', [{ target_type: 'baremetal', target_uuid: '12' }])).rejects.toThrow('must be a uuid');
    await expect(c.cloudAlerts.update('x', { target_type: 'baremetal', target_id: '12' })).rejects.toThrow('must be a uuid');
    expect(calls).toEqual([]);
  });
});
