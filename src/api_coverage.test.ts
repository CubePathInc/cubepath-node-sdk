import { CubePath } from './index';

type Call = { url: string; method: string; body?: any; form?: FormData };

function mockFetch(...responses: unknown[]): Call[] {
  const calls: Call[] = [];
  let i = 0;
  global.fetch = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const isForm = init?.body instanceof FormData;
    calls.push({
      url: String(url),
      method: init?.method ?? 'GET',
      body: init?.body && !isForm ? JSON.parse(String(init.body)) : undefined,
      form: isForm ? (init?.body as FormData) : undefined,
    });
    const body = responses.length ? responses[Math.min(i++, responses.length - 1)] : {};
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  return calls;
}

const client = () => new CubePath({ apiKey: 'k', baseURL: 'https://api.test', rateLimit: 1000, maxRetries: 0 });
const routes = (calls: Call[]) => calls.map((c) => `${c.method} ${c.url.replace('https://api.test', '')}`);

describe('ManagedDatabasesService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('covers the instance lifecycle', async () => {
    const calls = mockFetch({});
    const md = client().managedDatabases;
    await md.listPlans('valkey');
    await md.list();
    await md.create({ project_id: 1, name: 'cache', engine: 'valkey', version: '7.2.11', plan_uuid: 'p1', replicas: 2 });
    await md.get('m1');
    await md.update('m1', { label: 'prod' });
    await md.setProtection('m1', true);
    await md.scale('m1', { replicas: 3 });
    await md.delete('m1');
    expect(routes(calls)).toEqual([
      'GET /managed-database-plans/?engine=valkey',
      'GET /managed-databases/',
      'POST /managed-databases/',
      'GET /managed-databases/m1',
      'PATCH /managed-databases/m1',
      'POST /managed-databases/m1/protection',
      'POST /managed-databases/m1/scale',
      'DELETE /managed-databases/m1',
    ]);
    expect(calls[5].body).toEqual({ enabled: true });
    expect(calls[6].body).toEqual({ replicas: 3 });
  });

  it('covers credentials, config and metrics', async () => {
    const calls = mockFetch({});
    const md = client().managedDatabases;
    await md.getCredentials('m1');
    await md.rotateCredentials('m1');
    await md.getConfig('m1');
    await md.updateConfig('m1', { timeout: 300 });
    await md.getMetrics('m1', { metrics: ['cpu', 'memory'], time_range: '24h' });
    await md.getMetrics('m1');
    expect(routes(calls)).toEqual([
      'GET /managed-databases/m1/credentials',
      'POST /managed-databases/m1/credentials/rotate',
      'GET /managed-databases/m1/config',
      'PATCH /managed-databases/m1/config',
      'GET /managed-databases/m1/metrics?metrics=cpu%2Cmemory&time_range=24h',
      'GET /managed-databases/m1/metrics',
    ]);
    expect(calls[3].body).toEqual({ params: { timeout: 300 } });
  });

  it('covers logical databases and users', async () => {
    const calls = mockFetch({});
    const md = client().managedDatabases;
    await md.databases.list('m1');
    await md.databases.create('m1', 'appdb');
    await md.databases.delete('m1', 'd1');
    await md.users.list('m1');
    await md.users.create('m1', { username: 'app' });
    await md.users.delete('m1', 'u1');
    expect(routes(calls)).toEqual([
      'GET /managed-databases/m1/databases',
      'POST /managed-databases/m1/databases',
      'DELETE /managed-databases/m1/databases/d1',
      'GET /managed-databases/m1/users',
      'POST /managed-databases/m1/users',
      'DELETE /managed-databases/m1/users/u1',
    ]);
    expect(calls[1].body).toEqual({ name: 'appdb' });
    expect(calls[4].body).toEqual({ username: 'app' });
  });
});

describe('DDoSMitigationService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('covers IPs, profiles and the catalogs', async () => {
    const calls = mockFetch(
      { single_ips: [], subnets: [], total: 0 },
      { network: '203.0.113.5' },
      { detail: 'ok' },
      { detail: 'ok' },
      { countries: [{ iso_code: 'ES' }], total: 1 },
      { detail: 'ok' },
      { asns: [{ asn: 13335 }], total: 1 },
      { detail: 'ok' },
      { prefix_lists: [], total: 0 },
      { detail: 'ok' },
      { countries: [], total: 0 },
      { asns: [], total: 0 },
    );
    const d = client().ddosMitigation;
    await d.listIPs({ ip_type: 'IPv4', has_profile: false });
    await d.getProfile('203.0.113.5');
    await d.updateProfile('203.0.113.0/24', { udp_validation_level: 2 });
    await d.deleteProfile('203.0.113.5');
    const countries = await d.getProfileCountries('203.0.113.5');
    await d.setProfileCountries('203.0.113.5', ['ES']);
    const asns = await d.getProfileASNs('203.0.113.5');
    await d.setProfileASNs('203.0.113.5', [13335]);
    await d.getProfilePrefixLists('203.0.113.5');
    await d.setProfilePrefixLists('203.0.113.5', ['pl1']);
    await d.listCountries();
    await d.listASNs('cloudflare');
    expect(routes(calls)).toEqual([
      'GET /ddos-mitigation/ips?ip_type=IPv4&has_profile=false',
      'GET /ddos-mitigation/profiles/203.0.113.5',
      'PUT /ddos-mitigation/profiles/203.0.113.0/24',
      'DELETE /ddos-mitigation/profiles/203.0.113.5',
      'GET /ddos-mitigation/profiles/203.0.113.5/countries',
      'PUT /ddos-mitigation/profiles/203.0.113.5/countries',
      'GET /ddos-mitigation/profiles/203.0.113.5/asns',
      'PUT /ddos-mitigation/profiles/203.0.113.5/asns',
      'GET /ddos-mitigation/profiles/203.0.113.5/prefix-lists',
      'PUT /ddos-mitigation/profiles/203.0.113.5/prefix-lists',
      'GET /ddos-mitigation/countries',
      'GET /ddos-mitigation/asns?search=cloudflare',
    ]);
    expect(countries[0].iso_code).toBe('ES');
    expect(asns[0].asn).toBe(13335);
    expect(calls[5].body).toEqual({ iso_codes: ['ES'] });
    expect(calls[7].body).toEqual({ asns: [13335] });
    expect(calls[9].body).toEqual({ uuids: ['pl1'] });
  });

  it('covers firewall rules, prefix lists and traffic', async () => {
    const calls = mockFetch(
      { rules: [{ id: 1 }], total: 1 },
      { detail: 'ok' },
      { detail: 'ok' },
      { detail: 'ok' },
      { prefix_lists: [{ uuid: 'pl1' }], total: 1 },
      { detail: 'ok' },
      [{ network: '198.51.100.0/24' }],
      { detail: 'ok' },
      { detail: 'ok' },
      { detail: 'ok' },
      { total: 0, ips: [] },
      { buckets: [] },
      { logs: [] },
    );
    const d = client().ddosMitigation;
    const rules = await d.firewall.list('203.0.113.5');
    await d.firewall.create({ network: '203.0.113.5', protocol: 6, dst_port: 443, action: 50 });
    await d.firewall.delete(7);
    await d.firewall.deleteMatching({ network: '203.0.113.5', protocol: 6, dst_port: 443 });
    const lists = await d.prefixLists.list();
    await d.prefixLists.create({ name: 'office' });
    const entries = await d.prefixLists.listEntries('pl1');
    await d.prefixLists.addEntry('pl1', '198.51.100.0/24');
    await d.prefixLists.deleteEntry('pl1', '198.51.100.0/24');
    await d.prefixLists.delete('pl1');
    await d.traffic.listProtectedIPs();
    await d.traffic.stats({ start_time: '2026-09-30T00:00:00Z', end_time: '2026-09-30T01:00:00Z' });
    await d.traffic.capture({ start_time: 'a', end_time: 'b', destination_ip: '203.0.113.5', limit: 10 });
    expect(routes(calls)).toEqual([
      'GET /ddos-mitigation/firewall-rules/203.0.113.5',
      'POST /ddos-mitigation/firewall-rules',
      'DELETE /ddos-mitigation/firewall-rules/7',
      'DELETE /ddos-mitigation/firewall-rules/bulk?network=203.0.113.5&protocol=6&dst_port=443',
      'GET /ddos-mitigation/prefix-lists',
      'POST /ddos-mitigation/prefix-lists',
      'GET /ddos-mitigation/prefix-lists/pl1/entries',
      'POST /ddos-mitigation/prefix-lists/pl1/entries',
      'DELETE /ddos-mitigation/prefix-lists/pl1/entries/198.51.100.0/24',
      'DELETE /ddos-mitigation/prefix-lists/pl1',
      'GET /ddos-mitigation/traffic-capture/protected-ips',
      'POST /ddos-mitigation/traffic-capture/stats',
      'POST /ddos-mitigation/traffic-capture',
    ]);
    expect(rules[0].id).toBe(1);
    expect(lists[0].uuid).toBe('pl1');
    expect(entries).toEqual(['198.51.100.0/24']);
    expect(calls[7].body).toEqual({ network: '198.51.100.0/24' });
  });

  it('returns an empty attack list instead of the message, and reads attack details', async () => {
    const calls = mockFetch({ detail: 'No recent DDoS attacks were found for your IPs.' }, [], {});
    const ddos = client().ddos;
    expect(await ddos.listAttacks()).toEqual([]);
    await ddos.getAttackDetails(42);
    await ddos.getAttackTrafficGraph(42);
    expect(routes(calls).slice(1)).toEqual([
      'GET /ddos-attacks/attacks/42/details',
      'GET /ddos-attacks/attacks/42/traffic-graph',
    ]);
  });
});

describe('CloudAlertsService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('covers alerts and notificators', async () => {
    const calls = mockFetch({});
    const a = client().cloudAlerts;
    await a.list({ project_id: 882, status: 'enabled' });
    await a.create({
      project_id: 882,
      name: 'cpu',
      target_type: 'vps',
      target_id: '7',
      metric_type: 'cpu',
      operator: 'gt',
      threshold: 90,
      actions: [{ action_type: 'notify', notificator_id: 'n1' }],
    });
    await a.get('t1');
    await a.update('t1', { status: 'disabled' });
    await a.history('t1', 10);
    await a.delete('t1');
    await a.notificators.list();
    await a.notificators.create({ name: 'mail', type: 'email' });
    await a.notificators.get('n1');
    await a.notificators.update('n1', { enabled: false });
    await a.notificators.delete('n1');
    expect(routes(calls)).toEqual([
      'GET /triggers/?project_id=882&status=enabled',
      'POST /triggers/',
      'GET /triggers/t1',
      'PUT /triggers/t1',
      'GET /triggers/t1/history?limit=10',
      'DELETE /triggers/t1',
      'GET /triggers/notificators/',
      'POST /triggers/notificators/',
      'GET /triggers/notificators/n1',
      'PUT /triggers/notificators/n1',
      'DELETE /triggers/notificators/n1',
    ]);
    expect(calls[3].body).toEqual({ status: 'disabled' });
  });
});

describe('TranscoderService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('covers jobs and batches', async () => {
    const calls = mockFetch({});
    const t = client().transcoder;
    const output = { s3: { bucket: 'out', path: 'videos/' } };
    await t.createJob({
      input: { source: 'url', url: 'https://example.com/a.mp4' },
      output,
      outputs: [{ type: 'file', codec: 'h264', height: 360 }],
      idempotency_key: 'a',
    });
    await t.createBatch({ output, outputs: [{ type: 'hls' }], inputs: [{ url: 'https://example.com/b.mp4' }] });
    await t.listJobs({ batch_id: 'b1', limit: 10, offset: 20 });
    await t.getJob('j1');
    await t.getJobOutputs('j1');
    await t.cancelJob('j1');
    expect(routes(calls)).toEqual([
      'POST /transcoder/jobs',
      'POST /transcoder/jobs/batch',
      'GET /transcoder/jobs?batch_id=b1&limit=10&offset=20',
      'GET /transcoder/jobs/j1',
      'GET /transcoder/jobs/j1/outputs',
      'DELETE /transcoder/jobs/j1',
    ]);
    expect(calls[0].body.outputs).toEqual([{ type: 'file', codec: 'h264', height: 360 }]);
  });
});

describe('gaps in existing products', () => {
  afterEach(() => jest.restoreAllMocks());

  it('covers VPS actions and availability groups', async () => {
    const calls = mockFetch({ groups: [{ uuid: 'g1' }] });
    const vps = client().vps;
    await vps.plans();
    await vps.setProtection('7', true);
    await vps.moveToProject('7', 12);
    await vps.vncSession('7');
    await vps.addSSHKeys('7', [3, 4]);
    await vps.removeSSHKey('7', 3);
    await vps.attachNetwork('7', 73);
    await vps.detachNetwork('7');
    await vps.availabilityGroups.create({ project_id: 12, name: 'web', location_name: 'eu-bcn-1' });
    await vps.availabilityGroups.get('g1');
    const groups = await vps.availabilityGroups.list(12, 'eu-bcn-1');
    await vps.availabilityGroups.addVPS('g1', 7);
    await vps.availabilityGroups.removeVPS('g1', 7);
    await vps.availabilityGroups.moveToProject('g1', 13);
    await vps.availabilityGroups.delete('g1');
    expect(routes(calls)).toEqual([
      'GET /vps/plans',
      'POST /vps/7/protection',
      'POST /vps/7/move-project',
      'POST /vps/7/vnc-url',
      'POST /vps/7/ssh-keys',
      'DELETE /vps/7/ssh-keys/3',
      'POST /vps/7/network',
      'DELETE /vps/7/network',
      'POST /vps/availability-groups/',
      'GET /vps/availability-groups/g1',
      'GET /vps/availability-groups/project/12?location_name=eu-bcn-1',
      'POST /vps/availability-groups/g1/vps/7',
      'DELETE /vps/availability-groups/g1/vps/7',
      'POST /vps/availability-groups/g1/move-project',
      'DELETE /vps/availability-groups/g1',
    ]);
    expect(calls[4].body).toEqual([3, 4]);
    expect(calls[6].body).toEqual({ network_id: 73 });
    expect(groups[0].uuid).toBe('g1');
  });

  it('unwraps the VPS backup list and returns the new backup', async () => {
    const calls = mockFetch({ backups: [{ id: 1 }], total: 1, has_settings: false }, { id: 2, status: 'pending' });
    const b = client().vps.backups;
    const list = await b.list('7', { limit: 5 });
    const created = await b.create('7');
    expect(list).toEqual([{ id: 1 }]);
    expect(created.id).toBe(2);
    expect(calls[0].url).toBe('https://api.test/vps/7/backups?limit=5');
    expect(calls[1].body).toEqual({});
  });

  it('covers baremetal actions', async () => {
    const calls = mockFetch({});
    const bm = client().baremetal;
    await bm.listModels();
    await bm.listOS('9');
    await bm.kvm('9');
    await bm.setProtection('9', false);
    await bm.moveToProject('9', 12);
    await bm.addSSHKeys('9', [3]);
    await bm.removeSSHKey('9', 3);
    await bm.attachNetwork('9', 73);
    await bm.detachNetwork('9');
    expect(routes(calls)).toEqual([
      'GET /baremetal/models',
      'GET /baremetal/os/9',
      'GET /baremetal/9/kvm',
      'POST /baremetal/9/protection',
      'POST /baremetal/9/move-project',
      'POST /baremetal/9/ssh-keys',
      'DELETE /baremetal/9/ssh-keys/3',
      'POST /baremetal/9/network',
      'DELETE /baremetal/9/network',
    ]);
    expect(calls[5].body).toEqual([3]);
  });

  it('covers networks, SSH keys and projects', async () => {
    const calls = mockFetch({ sshkeys: [{ id: 1, name: 'a' }] });
    const c = client();
    await c.networks.moveToProject(73, 12);
    await c.networks.listBGPPeers(73);
    await c.networks.createBGPPeer(73, { peer_type: 'vps', peer_target: '7', remote_asn: 65001 });
    await c.networks.updateBGPPeer(73, 'p1', { enabled: false });
    await c.networks.deleteBGPPeer(73, 'p1');
    const keys = await c.sshKeys.list();
    await c.sshKeys.update(1, 'laptop');
    await c.projects.update(12, { name: 'prod' });
    expect(routes(calls)).toEqual([
      'POST /networks/73/move-project',
      'GET /networks/73/bgp-peers',
      'POST /networks/73/bgp-peers',
      'PATCH /networks/73/bgp-peers/p1',
      'DELETE /networks/73/bgp-peers/p1',
      'GET /sshkey/user/sshkeys',
      'PUT /sshkey/1',
      'PUT /projects/12',
    ]);
    expect(keys[0].name).toBe('a');
    expect(calls[6].body).toEqual({ name: 'laptop' });
  });

  it('covers CDN purge, token auth and metric filters', async () => {
    const calls = mockFetch({});
    const cdn = client().cdn;
    await cdn.purgeCache('z1', { paths: ['/img/*'] });
    await cdn.listPurges('z1');
    await cdn.rotateTokenSecret('z1');
    await cdn.signURL('z1', { path: '/v.mp4', expires_in: 600 });
    await cdn.getMetrics('z1', 'requests', { minutes: 30, status_range: '5xx', country: 'ES' });
    expect(routes(calls)).toEqual([
      'POST /cdn/zones/z1/purge-cache',
      'GET /cdn/zones/z1/purge-cache',
      'POST /cdn/zones/z1/token-auth/rotate-secret',
      'POST /cdn/zones/z1/token-auth/sign-url',
      'GET /cdn/zones/z1/metrics/requests?minutes=30&country=ES&status_range=5xx',
    ]);
    expect(calls[0].body).toEqual({ paths: ['/img/*'] });
  });

  it('covers DNS health checks, regions, move, scan and zone files', async () => {
    const calls = mockFetch({});
    const dns = client().dns;
    await dns.listRegions();
    await dns.listHealthChecks('z1');
    await dns.getHealthCheck('z1', 'r1');
    await dns.setHealthCheck('z1', 'r1', { name: 'web', check_type: 'tcp', port: 443 });
    await dns.deleteHealthCheck('z1', 'r1');
    await dns.moveZoneToProject('z1', 12);
    await dns.createZoneFromScan('example.com', 12);
    await dns.createZoneFromFile('example.com', 12, 'www 300 IN A 203.0.113.10\n');
    await dns.importZoneFile('z1', 'www 300 IN A 203.0.113.10\n', 'example.zone');
    expect(routes(calls)).toEqual([
      'GET /dns/regions',
      'GET /dns/zones/z1/health-checks',
      'GET /dns/zones/z1/records/r1/health-check',
      'PUT /dns/zones/z1/records/r1/health-check',
      'DELETE /dns/zones/z1/records/r1/health-check',
      'POST /dns/zones/z1/move-project',
      'POST /dns/zones/scan?domain=example.com&project_id=12',
      'POST /dns/zones/upload?domain=example.com&project_id=12',
      'POST /dns/zones/z1/import',
    ]);
    const file = calls[8].form?.get('file') as File;
    expect(file.name).toBe('example.zone');
    expect(await file.text()).toContain('203.0.113.10');
  });

  it('sends a file upload as multipart without a JSON content type', async () => {
    const headers: Array<Record<string, string>> = [];
    global.fetch = jest.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      headers.push(init?.headers as Record<string, string>);
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;
    await client().dns.importZoneFile('z1', 'x');
    expect(headers[0]['Content-Type']).toBeUndefined();
  });

  it('covers load balancer and Kubernetes actions', async () => {
    const calls = mockFetch({});
    const c = client();
    await c.loadBalancer.setProtection('lb1', true);
    await c.loadBalancer.moveToProject('lb1', 12);
    await c.loadBalancer.addTargets('lb1', 'l1', [
      { target_type: 'vps', target_uuid: '7', port: 80 },
      { target_type: 'vps', target_uuid: '8', port: 80 },
    ]);
    await c.kubernetes.setProtection('k1', true);
    await c.kubernetes.getMetrics('k1', '24h');
    await c.kubernetes.getNodeMetrics('k1', 'worker-1');
    expect(routes(calls)).toEqual([
      'POST /loadbalancer/lb1/protection',
      'POST /loadbalancer/lb1/move-project',
      'POST /loadbalancer/lb1/listeners/l1/targets/batch',
      'POST /kubernetes/k1/protection',
      'GET /kubernetes/k1/metrics?time_range=24h',
      'GET /kubernetes/k1/nodes/worker-1/metrics',
    ]);
    expect(calls[2].body.targets).toHaveLength(2);
  });
});
