# CubePath Node.js SDK

Official Node.js/TypeScript SDK for the [CubePath](https://cubepath.com) Cloud API.

[![CI](https://github.com/CubePathInc/cubepath-node-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/CubePathInc/cubepath-node-sdk/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@cubepath/sdk)](https://www.npmjs.com/package/@cubepath/sdk)

## Installation

```bash
npm install @cubepath/sdk
```

## Quick Start

```typescript
import { CubePath } from '@cubepath/sdk';

const client = new CubePath({
  apiKey: process.env.CUBEPATH_API_KEY!,
});

// List all projects
const projects = await client.projects.list();
console.log(projects);
```

## Authentication

All API requests require a Bearer token. Pass your API key when creating the client:

```typescript
const client = new CubePath({
  apiKey: 'your-api-key',
});
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `apiKey` | *required* | API key for authentication |
| `baseURL` | `https://api.cubepath.com` | API base URL |
| `userAgent` | `cubepath-node-sdk/0.1.0` | Custom User-Agent header |
| `maxRetries` | `3` | Maximum retry attempts on 429/5xx |
| `retryWaitMin` | `1000` | Minimum retry wait (ms) |
| `retryWaitMax` | `30000` | Maximum retry wait (ms) |
| `rateLimit` | `10` | Max requests per second |
| `timeout` | `30000` | Request timeout (ms) |

The client automatically retries on `429` (rate limited) and `5xx` (server error) responses with exponential backoff and jitter.

## Services

### Projects

```typescript
// Create a project
const project = await client.projects.create({
  name: 'my-project',
  description: 'Production workloads',
});

// List projects
const projects = await client.projects.list();

// Delete a project
await client.projects.delete(project.id);
```

### SSH Keys

```typescript
// Add an SSH key
const key = await client.sshKeys.create({
  name: 'my-key',
  ssh_key: 'ssh-ed25519 AAAA...',
});

// List SSH keys
const keys = await client.sshKeys.list();
```

### VPS

```typescript
// Create a VPS
const task = await client.vps.create('project-id', {
  name: 'web-server',
  plan_name: 'gp.small',
  template_name: 'debian-12',
  location_name: 'us-mia-1',
  ssh_key_names: ['my-key'],
  enable_backups: true,
});

// Power actions
await client.vps.power('vps-id', 'restart_vps');

// Resize
await client.vps.resize('vps-id', 'gp.pro');

// Reinstall
await client.vps.reinstall('vps-id', 'debian-12');

// Destroy
await client.vps.destroy('vps-id', true); // release floating IPs
```

#### VPS Backups

```typescript
// List backups
const backups = await client.vps.backups.list('vps-id');

// Create a backup
await client.vps.backups.create('vps-id', { notes: 'Before upgrade' });

// Restore a backup
await client.vps.backups.restore('vps-id', 'backup-id');

// Configure backup settings
await client.vps.backups.updateSettings('vps-id', {
  enabled: true,
  schedule_hour: 3,
  retention_days: 7,
  max_backups: 5,
});
```

#### VPS ISOs

```typescript
// List available ISOs
const isos = await client.vps.isos.list('vps-id');

// Mount an ISO
await client.vps.isos.mount('vps-id', 'iso-id');

// Unmount
await client.vps.isos.unmount('vps-id');
```

### Baremetal

```typescript
// Deploy a bare metal server
const task = await client.baremetal.deploy('project-id', {
  model_name: 'c1.metal.plus',
  location_name: 'us-hou-1',
  hostname: 'db-primary',
  password: 'secure-password',
  ssh_key_names: ['my-key'],
  os_name: 'debian-12',
});

// Power actions
await client.baremetal.power('baremetal-id', 'restart_metal');

// Rescue mode
const rescue = await client.baremetal.rescue('baremetal-id');
console.log(rescue.username, rescue.password);

// BMC sensors
const sensors = await client.baremetal.bmcSensors('baremetal-id');

// IPMI session
const session = await client.baremetal.ipmiSession('baremetal-id');
```

### Networks

```typescript
// Create a private network
const network = await client.networks.create({
  name: 'internal',
  location_name: 'us-mia-1',
  ip_range: '10.0.0.0',
  prefix: 24,
  project_id: 'project-id',
});

// Update a network
await client.networks.update('network-id', { label: 'production' });
```

### Floating IPs

```typescript
// Acquire a floating IP
const ip = await client.floatingIPs.acquire('ipv4', 'us-mia-1');

// Assign to a VPS
await client.floatingIPs.assign('vps', 'vps-id', ip.address);

// Configure reverse DNS
await client.floatingIPs.configureReverseDNS(ip.address, 'web.example.com');

// Unassign and release
await client.floatingIPs.unassign(ip.address);
await client.floatingIPs.release(ip.address);
```

### Firewall

```typescript
// Create a firewall group
const group = await client.firewall.create({
  name: 'web-rules',
  enabled: true,
  rules: [
    { direction: 'inbound', protocol: 'tcp', port: '443', source: '0.0.0.0/0' },
    { direction: 'inbound', protocol: 'tcp', port: '80', source: '0.0.0.0/0' },
  ],
});

// Assign to a VPS
await client.firewall.assignToVPS('vps-id', {
  firewall_group_ids: [group.id],
});
```

### DNS

```typescript
// Create a DNS zone
const zone = await client.dns.createZone({ domain: 'example.com' });

// Add records
await client.dns.createRecord(zone.uuid, {
  name: 'www',
  record_type: 'A',
  content: '203.0.113.10',
  ttl: 300,
});

await client.dns.createRecord(zone.uuid, {
  name: 'mail',
  record_type: 'MX',
  content: 'mail.example.com',
  ttl: 3600,
  priority: 10,
});

// Verify zone delegation
const verification = await client.dns.verifyZone(zone.uuid);
```

### Load Balancer

```typescript
// Create a load balancer
const lb = await client.loadBalancer.create({
  name: 'web-lb',
  plan_name: 'lb.small',
  location_name: 'eu-bcn-1',
});

// Add a listener
const listener = await client.loadBalancer.createListener(lb.uuid, {
  name: 'https',
  protocol: 'tcp',
  source_port: 443,
  target_port: 443,
  algorithm: 'round_robin',
  sticky_sessions: false,
});

// Add targets
await client.loadBalancer.addTarget(lb.uuid, listener.uuid, {
  target_type: 'vps',
  target_uuid: 'vps-id',
  weight: 100,
});

// Configure health checks
await client.loadBalancer.configureHealthCheck(lb.uuid, listener.uuid, {
  protocol: 'http',
  path: '/health',
  interval_seconds: 10,
  timeout_seconds: 5,
  healthy_threshold: 3,
  unhealthy_threshold: 3,
});

// List available plans
const plans = await client.loadBalancer.listPlans();
```

### CDN

```typescript
// Create a CDN zone
const zone = await client.cdn.createZone({
  name: 'my-cdn',
  plan_name: 'cdn.starter',
});

// Add an origin
await client.cdn.createOrigin(zone.uuid, {
  name: 'primary',
  address: 'origin.example.com',
  port: 443,
  protocol: 'https',
  weight: 100,
  priority: 1,
  is_backup: false,
  health_check_enabled: true,
  health_check_path: '/health',
  verify_ssl: true,
  enabled: true,
});

// Create an edge rule
await client.cdn.createRule(zone.uuid, {
  name: 'cache-static',
  rule_type: 'cache',
  priority: 1,
  action_config: { cache_ttl: 86400 },
  enabled: true,
});

// Get metrics
const metrics = await client.cdn.getMetrics(zone.uuid, 'bandwidth', {
  minutes: 60,
});
```

#### CDN WAF

```typescript
// Create a WAF rule
await client.cdn.waf.create(zone.uuid, {
  name: 'block-scanners',
  rule_type: 'block',
  priority: 1,
  action_config: { action: 'block' },
  match_conditions: { user_agent: '*scanner*' },
  enabled: true,
});

// List WAF rules
const wafRules = await client.cdn.waf.list(zone.uuid);
```

### Kubernetes

```typescript
// Create a cluster
const cluster = await client.kubernetes.create({
  project_id: 'project-id',
  name: 'production',
  location_name: 'us-mia-1',
  ha_control_plane: true,
  node_pools: [
    { name: 'workers', plan: 'gp.small', count: 3 },
  ],
});

// Get kubeconfig
const kubeconfig = await client.kubernetes.getKubeconfig(cluster.uuid!);

// List versions and plans
const versions = await client.kubernetes.listVersions();
const plans = await client.kubernetes.listPlans();
```

#### Node Pools

```typescript
// Add a node pool
const pool = await client.kubernetes.nodePools.create('cluster-uuid', {
  name: 'gpu-pool',
  plan: 'gp.pro',
  count: 2,
  auto_scale: true,
  labels: { workload: 'ml' },
});

// Scale up
await client.kubernetes.nodePools.addNodes('cluster-uuid', pool.uuid!, 2);

// Update autoscaling
await client.kubernetes.nodePools.update('cluster-uuid', pool.uuid!, {
  min_nodes: 2,
  max_nodes: 10,
  auto_scale: true,
});
```

#### Addons

```typescript
// List available addons
const addons = await client.kubernetes.addons.listAvailable();

// Install an addon
await client.kubernetes.addons.install('cluster-uuid', 'cert-manager');

// List installed addons
const installed = await client.kubernetes.addons.listInstalled('cluster-uuid');
```

### Pricing

```typescript
// Get all pricing information
const pricing = await client.pricing.get();

for (const location of pricing.vps.locations) {
  console.log(`${location.location_name}: ${location.description}`);
  for (const cluster of location.clusters) {
    for (const plan of cluster.plans) {
      console.log(`  ${plan.plan_name}: $${plan.price_per_hour}/hr`);
    }
  }
}
```

### DDoS

```typescript
// List DDoS attacks
const attacks = await client.ddos.listAttacks();
for (const attack of attacks) {
  console.log(`${attack.ip_address}: ${attack.status} (${attack.duration}s)`);
}
```

## Error Handling

```typescript
import { CubePath, CubePathError } from '@cubepath/sdk';

const client = new CubePath({ apiKey: 'your-api-key' });

try {
  await client.vps.get('non-existent-id');
} catch (err) {
  if (CubePathError.isNotFound(err)) {
    console.log('VPS not found');
  } else if (CubePathError.isRateLimited(err)) {
    console.log('Rate limited, retries exhausted');
  } else if (CubePathError.isServerError(err)) {
    console.log('Server error');
  } else if (err instanceof CubePathError) {
    console.log(`API error ${err.statusCode}: ${err.message}`);
  }
}
```

## Related Projects

- [cubepath-go-sdk](https://github.com/CubePathInc/cubepath-go-sdk) - Go SDK
- [cubecli](https://github.com/CubePathInc/cubecli) - CLI tool
- [terraform-provider-cubepath](https://github.com/CubePathInc/terraform-provider-cubepath) - Terraform provider

## License

MIT
