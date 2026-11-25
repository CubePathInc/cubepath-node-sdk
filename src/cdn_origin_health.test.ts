import { CubePath } from './index';

type Call = { url: string; method: string; body?: any };

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

describe('CDN origin health checks', () => {
  afterEach(() => jest.restoreAllMocks());

  it('creates an origin with an http health check and reads health_detail', async () => {
    const calls = mockFetch({
      uuid: 'o1',
      health_check_type: 'http',
      health_status: 'unhealthy',
      health_detail: 'connection refused',
      health_changed_at: '2026-11-25T10:00:00Z',
    });
    const origin = await client().cdn.createOrigin('z1', {
      name: 'api',
      address: 'api.example.com',
      health_check_enabled: true,
      health_check_type: 'http',
      health_check_path: '/healthz',
      health_check_method: 'HEAD',
      health_check_expected_status: '200 204',
      health_check_interval: 15,
      health_check_threshold: 2,
    });
    expect(calls[0]).toMatchObject({ url: 'https://api.test/cdn/zones/z1/origins', method: 'POST' });
    expect(calls[0].body).toMatchObject({
      health_check_type: 'http',
      health_check_method: 'HEAD',
      health_check_expected_status: '200 204',
      health_check_interval: 15,
      health_check_threshold: 2,
    });
    expect(origin.health_detail).toBe('connection refused');
    expect(origin.health_changed_at).toBe('2026-11-25T10:00:00Z');
  });

  it('sends only the health check fields that are set on update', async () => {
    const calls = mockFetch({ uuid: 'o1' });
    await client().cdn.updateOrigin('z1', 'o1', { health_check_type: 'http', health_check_interval: 30 });
    expect(calls[0]).toMatchObject({ method: 'PATCH', url: 'https://api.test/cdn/zones/z1/origins/o1' });
    expect(calls[0].body).toEqual({ health_check_type: 'http', health_check_interval: 30 });
  });
});
