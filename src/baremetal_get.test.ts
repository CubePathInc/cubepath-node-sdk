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
