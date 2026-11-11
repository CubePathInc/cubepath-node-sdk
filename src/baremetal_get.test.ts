import { CubePath } from './index';

function mockProjects(projects: unknown): void {
  global.fetch = jest.fn(async () => new Response(JSON.stringify(projects), { status: 200 })) as unknown as typeof fetch;
}

const client = () => new CubePath({ apiKey: 'test-key', baseURL: 'https://api.test', rateLimit: 1000 });

describe('BaremetalService.get', () => {
  afterEach(() => jest.restoreAllMocks());

  it('finds a server whose id comes as a number in the JSON', async () => {
    mockProjects([{ baremetals: [{ id: 4, hostname: 'a' }, { id: 5, hostname: 'b' }] }]);
    expect((await client().baremetal.get('5')).hostname).toBe('b');
  });

  it('finds a server whose id comes as a uuid', async () => {
    mockProjects([{ baremetals: [{ id: '0b9f6a3e-1c2d-4e5f-8a7b-9c0d1e2f3a4b', hostname: 'c' }] }]);
    expect((await client().baremetal.get('0b9f6a3e-1c2d-4e5f-8a7b-9c0d1e2f3a4b')).hostname).toBe('c');
  });

  it('keeps failing with not found for an unknown id', async () => {
    mockProjects([{ baremetals: [{ id: 4, hostname: 'a' }] }]);
    await expect(client().baremetal.get('9')).rejects.toThrow('Baremetal 9 not found');
  });
});

const UUID = '0b9f6a3e-1c2d-4e5f-8a7b-9c0d1e2f3a4b';

describe('BaremetalService.get with both API shapes', () => {
  afterEach(() => jest.restoreAllMocks());

  it('post-cutover: finds by number or by uuid (any case) when id is a number and uuid is added', async () => {
    mockProjects([{ baremetals: [{ id: 4, uuid: 'x', hostname: 'a' }, { id: 5, uuid: UUID, hostname: 'b' }] }]);
    expect((await client().baremetal.get('5')).hostname).toBe('b');
    expect((await client().baremetal.get(5)).hostname).toBe('b');
    expect((await client().baremetal.get(UUID)).hostname).toBe('b');
    expect((await client().baremetal.get(UUID.toUpperCase())).hostname).toBe('b');
  });

  it('pre-cutover: no uuid field, number match still works and a uuid is not found', async () => {
    mockProjects([{ baremetals: [{ id: 5, hostname: 'b' }] }]);
    expect((await client().baremetal.get('5')).hostname).toBe('b');
    await expect(client().baremetal.get(UUID)).rejects.toThrow(`Baremetal ${UUID} not found`);
  });

  it('a numeric string id from an older API matches', async () => {
    mockProjects([{ baremetals: [{ id: '5', hostname: 'b' }] }]);
    expect((await client().baremetal.get(5)).hostname).toBe('b');
  });

  it('an empty uuid never matches', async () => {
    mockProjects([{ baremetals: [{ id: 5, uuid: '', hostname: 'b' }] }]);
    await expect(client().baremetal.get('7')).rejects.toThrow('not found');
  });
});

describe('baremetal reference validation', () => {
  const calls: string[] = [];
  beforeEach(() => {
    calls.length = 0;
    global.fetch = jest.fn(async (url: unknown) => {
      calls.push(String(url));
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;
  });
  afterEach(() => jest.restoreAllMocks());

  it('passes a number and a lower-cased uuid through to the URL', async () => {
    await client().baremetal.kvm('9');
    await client().baremetal.kvm(9);
    await client().baremetal.kvm(UUID.toUpperCase());
    await client().baremetal.power(UUID, 'restart_metal');
    await client().baremetal.listOS(UUID);
    await client().baremetal.ipmiSession(UUID);
    expect(calls).toEqual([
      'https://api.test/baremetal/9/kvm',
      'https://api.test/baremetal/9/kvm',
      `https://api.test/baremetal/${UUID}/kvm`,
      `https://api.test/baremetal/${UUID}/power/restart_metal`,
      `https://api.test/baremetal/os/${UUID}`,
      `https://api.test/ipmi-proxy/create-session/${UUID}`,
    ]);
  });

  it.each(['', 'abc', '5/../x', '5 ', '-1', '1.5', '0b9f6a3e1c2d4e5f8a7b9c0d1e2f3a4b', `${UUID}x`])(
    'rejects %j before any request',
    async (bad) => {
      const bm = client().baremetal;
      await expect(bm.kvm(bad)).rejects.toThrow('Invalid baremetal reference');
      await expect(bm.get(bad)).rejects.toThrow('Invalid baremetal reference');
      await expect(bm.bmcSensors(bad)).rejects.toThrow('Invalid baremetal reference');
      expect(calls).toEqual([]);
    },
  );

  it('rejects a non integer number', async () => {
    await expect(client().baremetal.kvm(1.5)).rejects.toThrow('Invalid baremetal reference');
    expect(calls).toEqual([]);
  });

  it('sends a number to GraphQL as given', async () => {
    const bodies: string[] = [];
    global.fetch = jest.fn(async (_u: unknown, init?: RequestInit) => {
      bodies.push(String(init?.body));
      return new Response(JSON.stringify({ data: { baremetal: { sensors: { temperatures: [], fans: [] } } } }), { status: 200 });
    }) as unknown as typeof fetch;
    await client().baremetal.bmcSensors(7);
    expect(bodies).toHaveLength(1);
    expect(JSON.parse(bodies[0]).variables).toEqual({ id: '7' });
  });

  it('resolves a uuid to the server number before asking GraphQL', async () => {
    const bodies: string[] = [];
    global.fetch = jest.fn(async (u: unknown, init?: RequestInit) => {
      if (String(u).includes('/projects/')) {
        return new Response(JSON.stringify([{ baremetals: [{ id: 42, uuid: UUID, hostname: 'x' }] }]), { status: 200 });
      }
      bodies.push(String(init?.body));
      return new Response(JSON.stringify({ data: { baremetal: { sensors: { temperatures: [], fans: [] } } } }), { status: 200 });
    }) as unknown as typeof fetch;
    await client().baremetal.bmcSensors(UUID.toUpperCase());
    expect(JSON.parse(bodies[0]).variables).toEqual({ id: '42' });
  });
});
