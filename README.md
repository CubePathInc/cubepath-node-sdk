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
| `userAgent` | `cubepath-node-sdk/<version>` | Custom User-Agent header |
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

// Rename a project
await client.projects.update(project.id, { name: 'production' });

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

// Rename a key
await client.sshKeys.update(keys[0].id, 'laptop');
```

### VPS

```typescript
// Create a VPS
const task = await client.vps.create('project-id', {
  name: 'web-server',
  plan_name: 'gp.small',
  template_name: 'debian-12',
  location_name: 'us-mia-1',
  ssh_key_ids: [12],
  enable_backups: true,
});

// Power actions
await client.vps.power('vps-id', 'restart_vps');

// Resize
await client.vps.resize('vps-id', 'gp.pro');

// Reinstall
await client.vps.reinstall('vps-id', 'debian-12');

// Plans by location with prices and stock
const plans = await client.vps.plans();

// Deletion protection and moving to another project
await client.vps.setProtection('vps-id', true);
await client.vps.moveToProject('vps-id', 12);

// SSH keys (installed on the next reinstall) and private network
await client.vps.addSSHKeys('vps-id', [12, 47]);
await client.vps.removeSSHKey('vps-id', 47);
await client.vps.attachNetwork('vps-id', 73);
await client.vps.detachNetwork('vps-id');

// noVNC console session (valid 5 minutes; the ticket is the VNC password)
const vnc = await client.vps.vncSession('vps-id');

// Destroy
await client.vps.destroy('vps-id', true); // release floating IPs
```

#### Availability Groups

```typescript
// VPS in a group are spread over different hosts
const group = await client.vps.availabilityGroups.create({
  project_id: 12,
  name: 'web',
  location_name: 'eu-bcn-1',
});
await client.vps.availabilityGroups.addVPS(group.uuid, 'vps-id');
const groups = await client.vps.availabilityGroups.list(12);
await client.vps.availabilityGroups.removeVPS(group.uuid, 'vps-id');
await client.vps.availabilityGroups.delete(group.uuid);
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
  ssh_key_ids: [12],
  os_name: 'debian-12',
});

// Power actions
await client.baremetal.power('baremetal-id', 'restart_metal');

// Rescue mode
const rescue = await client.baremetal.rescue('baremetal-id');
console.log(rescue.username, rescue.password);

// BMC sensors (temperatures in CELSIUS, fans in RPM; last_seen is the last BMC poll)
const sensors = await client.baremetal.bmcSensors('baremetal-id');

// Reinstall progress (the server status is 'deploying' while it runs) and cancel
const status = await client.baremetal.reinstallStatus('baremetal-id');
await client.baremetal.cancelReinstall('baremetal-id');

// IPMI session
const session = await client.baremetal.ipmiSession('baremetal-id');

// KVM console credentials, models by location, operating systems for a reinstall
const kvm = await client.baremetal.kvm('baremetal-id');
const models = await client.baremetal.listModels();
const osOptions = await client.baremetal.listOS('baremetal-id');

// Protection, project, SSH keys and private network
await client.baremetal.setProtection('baremetal-id', true);
await client.baremetal.moveToProject('baremetal-id', 12);
await client.baremetal.addSSHKeys('baremetal-id', [12]);
await client.baremetal.attachNetwork('baremetal-id', 73);
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

// Move it to another project
await client.networks.moveToProject(73, 12);

// BGP sessions between the network's routers and a server
const peer = await client.networks.createBGPPeer(73, {
  peer_type: 'vps',
  peer_target: 'vps-id',
  remote_asn: 65001,
});
const peers = await client.networks.listBGPPeers(73); // last_state, received_prefixes...
await client.networks.updateBGPPeer(73, peer.peer_id, { enabled: false });
await client.networks.deleteBGPPeer(73, peer.peer_id);
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
  project_id: 12,
  name: 'web-rules',
  enabled: true,
  rules: [
    { direction: 'in', protocol: 'tcp', port: '443', source: '0.0.0.0/0' },
    { direction: 'in', protocol: 'tcp', port: '80', source: '0.0.0.0/0' },
  ],
});

// Replace the groups of a VPS (at most 10, in priority order; [] removes them all)
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

// Health check on an A/AAAA record (Pro and Business zones): an unhealthy value is
// left out of the answers until it recovers
const record = (await client.dns.listRecordsByType(zone.uuid, 'A'))[0];
await client.dns.setHealthCheck(zone.uuid, record.uuid, {
  name: 'web',
  check_type: 'https',
  path: '/health',
});
const checks = await client.dns.listHealthChecks(zone.uuid);
await client.dns.deleteHealthCheck(zone.uuid, record.uuid);

// SOA settings
await client.dns.updateSOA(zone.uuid, { refresh: 7200 });

// Import a BIND zone file into a zone, or create a zone from one or from public DNS
await client.dns.importZoneFile(zone.uuid, fs.readFileSync('example.com.zone', 'utf8'));
await client.dns.createZoneFromFile('example.org', 12, fs.readFileSync('example.org.zone', 'utf8'));
await client.dns.createZoneFromScan('example.net', 12);

// GeoDNS regions, move to another project
const regions = await client.dns.listRegions();
await client.dns.moveZoneToProject(zone.uuid, 12);
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

// Add several targets at once
await client.loadBalancer.addTargets(lb.uuid, listener.uuid, [
  { target_type: 'vps', target_uuid: 'vps-id-1', port: 443 },
  { target_type: 'vps', target_uuid: 'vps-id-2', port: 443 },
]);

// Protection and project
await client.loadBalancer.setProtection(lb.uuid, true);
await client.loadBalancer.moveToProject(lb.uuid, 12);

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

// Get metrics (optional filters: country, asn, status, status_range, cache_status...)
const metrics = await client.cdn.getMetrics(zone.uuid, 'bandwidth', {
  minutes: 60,
  status_range: '5xx',
});

// Purge the cache everywhere, or some paths ("/img/*" purges a prefix)
await client.cdn.purgeCache(zone.uuid, { paths: ['/index.html', '/img/*'] });
const purges = await client.cdn.listPurges(zone.uuid);

// Token auth: enable it (the secret is returned once), then sign URLs
const { token_auth_secret } = await client.cdn.updateZone(zone.uuid, { token_auth_enabled: true });
const signed = await client.cdn.signURL(zone.uuid, { path: '/videos/clip.mp4', expires_in: 3600 });
await client.cdn.rotateTokenSecret(zone.uuid);
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

// Health metrics of the cluster and of one node (1h, 3h, 6h, 12h, 24h, 3d, 7d, 30d)
const metrics = await client.kubernetes.getMetrics(cluster.uuid!, '24h');
const nodeMetrics = await client.kubernetes.getNodeMetrics(cluster.uuid!, 'worker-1');

// Deletion protection
await client.kubernetes.setProtection(cluster.uuid!, true);
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

### NAT Gateway

```typescript
// List available plans
const plans = await client.natGateway.listPlans();

// Create a NAT gateway
const gw = await client.natGateway.create({
  name: 'my-nat-gw',
  plan_name: 'nat.small',
  network_id: 42,
  project_id: 7,
});

// Get a NAT gateway
const gw = await client.natGateway.get('gw-uuid');

// Update name/label
await client.natGateway.update('gw-uuid', { label: 'production' });

// Resize to a different plan
await client.natGateway.resize('gw-uuid', 'nat.medium');

// Move to another project
await client.natGateway.moveToProject('gw-uuid', 12);

// Enable/disable deletion protection
await client.natGateway.setProtection('gw-uuid', true);

// Traffic metrics (H1 by default: H1, H3, H6, H12, H24, D3, D7, D30) and month-to-date usage
const metrics = await client.natGateway.getMetrics('gw-uuid', 'H24');
const bandwidth = await client.natGateway.getBandwidthUsage('gw-uuid');

// Delete a NAT gateway
await client.natGateway.delete('gw-uuid');
```

### Object Storage

S3 compatible buckets. Buckets and keys are created asynchronously: poll until `status` is
`active`. Use any S3 client (AWS SDK, rclone, aws cli) with the key against the tier `endpoint`.

```typescript
// List tiers with endpoint, prices and free tier
const tiers = await client.objectStorage.listTiers();

// Create a bucket
const bucket = await client.objectStorage.createBucket({
  name: 'my-backups',
  tier: 'infrequent_access',
  project_id: 12,
});

// Get a bucket (connection info, month usage, CDN origin)
const detail = await client.objectStorage.getBucket(bucket.uuid);

// Versioning or deletion protection
await client.objectStorage.updateBucket(bucket.uuid, { versioning: 'enabled', protected: true });

// Create an access key: the secret is only returned here
const key = await client.objectStorage.createKey({
  name: 'backups',
  tier: 'infrequent_access',
  permission: 'read_write',
  bucket_uuids: [bucket.uuid], // omit for every bucket of the project
});
console.log(key.access_key_id, key.secret_access_key, key.endpoint, key.region);

// List buckets and keys, month usage and cost
const buckets = await client.objectStorage.listBuckets({ project_id: 12 });
const keys = await client.objectStorage.listKeys();
const usage = await client.objectStorage.getUsage({ period: '2026-09' });

// Charts of one bucket (GraphQL): stored size and objects, traffic and responses per step
// over H1, H3, H6, H12, H24 (default), D3, D7 or D30
const metrics = await client.objectStorage.getBucketMetrics(bucket.uuid, 'D7');

// Delete a key, and a bucket (force purges its content first)
await client.objectStorage.deleteKey(key.uuid);
await client.objectStorage.deleteBucket(bucket.uuid, { force: true });
```

Lifecycle rules delete objects in the background, permanently. `putBucketLifecycle` replaces every
rule and is applied asynchronously (seconds, up to about 12 minutes after a previous change of the same
bucket); objects go within 48 hours of their due date. In a versioned bucket an expiration only
adds a delete marker: add a `noncurrent_version_expiration` rule to free space.

```typescript
const change = await client.objectStorage.putBucketLifecycle(bucket.uuid, [
  { id: 'logs-30d', enabled: true, filter: { prefix: 'logs/' }, expiration: { days: 30 } },
  { id: 'old-versions', enabled: true, noncurrent_version_expiration: { noncurrent_days: 30 } },
]);
const lifecycle = await client.objectStorage.getBucketLifecycle(bucket.uuid); // applied when applied_generation >= generation
await client.objectStorage.deleteBucketLifecycle(bucket.uuid);
```

#### Object Lock

Object Lock (WORM) keeps object versions from being deleted or overwritten until their
retention date. It can only be enabled when the bucket is created, never later; the bucket
always keeps versioning enabled and is created with deletion protection on.

- `governance`: keys created with `bypass_governance` can still delete a version early (sending
  `x-amz-bypass-governance-retention: true`).
- `compliance`: nobody can delete a version or shorten its retention before the date, CubePath
  included. Only organizations that support enabled for it can use it.

```typescript
const vault = await client.objectStorage.createBucket({
  name: 'veeam-repo',
  tier: 'infrequent_access',
  object_lock: true, // implies versioning: do not send versioning: false
  object_lock_default: { mode: 'governance', days: 30 }, // or { mode, years }
  accept_object_lock_terms: true,
});
console.log(vault.object_lock.enabled);

// Change the default retention (a compliance rule can only be kept or lengthened).
// accept_object_lock_terms is needed when the rule turns compliance on or gets longer.
await client.objectStorage.setBucketObjectLock(vault.uuid, {
  default_retention: { mode: 'governance', years: 1 },
  accept_object_lock_terms: true,
});
await client.objectStorage.setBucketObjectLock(vault.uuid, { default_retention: null }); // remove it

// A key that may delete governance versions early (read_write only)
await client.objectStorage.createKey({
  name: 'veeam',
  tier: 'infrequent_access',
  permission: 'read_write',
  bypass_governance: true,
});

// Delete: disable protection first. bypass_governance (with force) also purges governance
// versions. Versions under compliance or a legal hold are kept: the bucket stays with
// locked_content_kept set and keeps being billed until their retention ends.
await client.objectStorage.deleteBucket(vault.uuid, { force: true, bypass_governance: true });
```

Buckets are private. To serve one publicly, add it as an origin of a CDN zone:

```typescript
await client.cdn.createOrigin(zone.uuid, {
  name: 'my-bucket',
  object_storage_bucket_uuid: bucket.uuid,
});
```

#### Event Notifications

Send bucket events (`object.created`, `object.removed`, `object.tagging`) to a signed webhook
or to a Cloud Alerts channel. A destination belongs to the organization; a rule on a bucket picks
the events, an optional key prefix and suffix, and the destination. The signing secret is only
returned by `createEventDestination` and `rotateEventDestinationSecret`: store it then. After a
rotation the previous secret keeps signing for 24 hours.

```typescript
const { destination, signing_secret } = await client.objectStorage.createEventDestination({
  name: 'uploads-hook',
  type: 'webhook',
  url: 'https://example.com/hooks/storage', // or type: 'notificator', notificator_id: channelId
});

const rule = await client.objectStorage.createEventRule(bucket.uuid, {
  name: 'new-uploads',
  destination_uuid: destination.uuid,
  events: ['object.created'],
  prefix: 'incoming/',
}); // rule.status is "pending" until applied, then "active"

await client.objectStorage.testEventDestination(destination.uuid); // sends a cubepath.ping
const page = await client.objectStorage.listEventDeliveries(destination.uuid, { status: 'failed', limit: 20 });
// Older page: { before: page.next_before } while next_before is not null (unix milliseconds).
```

Verify every webhook delivery before trusting it, against the raw body. `CubePath-Signature`
holds one or more `v1=<hex>` values (`v1=<new>, v1=<previous>` for 24 hours after a rotation), each the HMAC-SHA256 of `CubePath-Timestamp + "." + body`;
`verifyStorageEventSignature` compares them in constant time and rejects timestamps more than
5 minutes away:

```typescript
import express from 'express';
import { verifyStorageEventSignature } from '@cubepath/sdk';

app.post('/hooks/storage', express.raw({ type: '*/*' }), (req, res) => {
  try {
    verifyStorageEventSignature(secret, req.header('CubePath-Timestamp') ?? '', req.body,
      req.header('CubePath-Signature') ?? '');
  } catch {
    return res.sendStatus(401);
  }
  // Deliveries are at least once: deduplicate by the CubePath-Event-Id header.
  res.sendStatus(204);
});
```

#### Presigned URLs

This SDK talks to the CubePath API, not to S3. To share one object for a while, sign a
presigned GET URL with the official S3 SDK and one of your access keys: endpoint
`https://eu.cubestorage.io`, region `eu`, path style, SigV4. A URL lasts at most 24 hours
(86400 seconds), the file is always downloaded as an attachment (do not set
`ResponseContentDisposition` or any other `response-*` override: they are refused) and every
download counts as egress of the bucket. Deleting the access key that signed a URL cuts it
before it expires. From a terminal, `cubecli s3 presign <bucket>/<key> --expires 6h` does the
same.

```typescript
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'eu',
  endpoint: 'https://eu.cubestorage.io',
  forcePathStyle: true,
  credentials: { accessKeyId: key.access_key_id, secretAccessKey: key.secret_access_key },
});
const url = await getSignedUrl(
  s3,
  new GetObjectCommand({ Bucket: 'my-backups', Key: 'reports/2026-09.pdf' }),
  { expiresIn: 86400 },
);
```

### Managed Databases

MySQL, PostgreSQL and Valkey. Databases are provisioned asynchronously: poll `get` until
`status` is `active`. Prices are per node (replica) per hour.

```typescript
// Plans by location, optionally for one engine
const plans = await client.managedDatabases.listPlans('postgresql');

const db = await client.managedDatabases.create({
  project_id: 12,
  name: 'app-db',
  engine: 'postgresql',
  version: '17.5.0',
  plan_uuid: plans[0].plans[0].uuid,
  replicas: 2,
});

const detail = await client.managedDatabases.get(db.uuid);
const creds = await client.managedDatabases.getCredentials(db.uuid); // host, port, username, password, uri

// Logical databases (not for Valkey) and users: the user password is only returned here
await client.managedDatabases.databases.create(db.uuid, 'appdb');
const user = await client.managedDatabases.users.create(db.uuid, { username: 'app' });

// Tunable parameters
const config = await client.managedDatabases.getConfig(db.uuid);
await client.managedDatabases.updateConfig(db.uuid, { statement_timeout: 30000 });

// Scale, rotate the admin password, metrics
await client.managedDatabases.scale(db.uuid, { replicas: 3 });
await client.managedDatabases.rotateCredentials(db.uuid);
const metrics = await client.managedDatabases.getMetrics(db.uuid, { time_range: '24h' });

// Protection, label and backup policy, delete
await client.managedDatabases.setProtection(db.uuid, true);
await client.managedDatabases.update(db.uuid, { label: 'production' });
await client.managedDatabases.setProtection(db.uuid, false);
await client.managedDatabases.delete(db.uuid);
```

### DDoS Mitigation

Settings of your IPs with Premium DDoS protection. `network` is an IP or a subnet in CIDR form.

```typescript
const ips = await client.ddosMitigation.listIPs();

// Protection profile (levels 0-10, rate limits, geo / ASN / prefix list filtering)
const profile = await client.ddosMitigation.getProfile('203.0.113.10');
await client.ddosMitigation.updateProfile('203.0.113.10', { udp_validation_level: 2, country_mode: 1 });
await client.ddosMitigation.setProfileCountries('203.0.113.10', ['CN', 'RU']);
await client.ddosMitigation.setProfileASNs('203.0.113.10', [64496]);
const countries = await client.ddosMitigation.listCountries();

// Firewall rules (action 50 = TLS validation, protocol 6 = TCP)
await client.ddosMitigation.firewall.create({ network: '203.0.113.10', protocol: 6, dst_port: 443, action: 50 });
const rules = await client.ddosMitigation.firewall.list('203.0.113.10');
await client.ddosMitigation.firewall.delete(rules[0].id);

// Prefix lists
await client.ddosMitigation.prefixLists.create({ name: 'office' });
const list = (await client.ddosMitigation.prefixLists.list()).find((l) => l.name === 'office')!;
await client.ddosMitigation.prefixLists.addEntry(list.uuid, '198.51.100.0/24');
await client.ddosMitigation.setProfilePrefixLists('203.0.113.10', [list.uuid]);

// Traffic seen by the scrubbers
const stats = await client.ddosMitigation.traffic.stats({
  start_time: '2026-09-30T00:00:00Z',
  end_time: '2026-09-30T01:00:00Z',
  interval: '5m',
});
const packets = await client.ddosMitigation.traffic.capture({
  start_time: '2026-09-30T00:00:00Z',
  end_time: '2026-09-30T01:00:00Z',
  destination_ip: '203.0.113.10',
  include_actions: ['DROP'],
  limit: 1000,
});
```

### Cloud Alerts

```typescript
// A channel: email goes to your address, Slack and Discord take a webhook URL
const channel = await client.cloudAlerts.notificators.create({ name: 'ops', type: 'email' });

const alert = await client.cloudAlerts.create({
  project_id: 12,
  name: 'high cpu',
  target_type: 'vps',
  target_id: 'vps-id',
  metric_type: 'cpu',
  operator: 'gt',
  threshold: 90,
  duration_seconds: 300,
  actions: [{ action_type: 'notify', notificator_id: channel.id }],
});

// Pause it, read its history, delete it
await client.cloudAlerts.update(alert.id, { status: 'disabled' });
const events = await client.cloudAlerts.history(alert.id);
await client.cloudAlerts.delete(alert.id);
await client.cloudAlerts.notificators.delete(channel.id);
```

### Video Transcoder

Input from a URL or any S3 compatible bucket; output to your bucket (for example a CubePath
Object Storage bucket and key).

```typescript
const job = await client.transcoder.createJob({
  input: { source: 'url', url: 'https://example.com/video.mp4' },
  output: {
    s3: {
      endpoint: 'https://eu.cubestorage.io',
      region: 'eu',
      bucket: 'my-videos',
      path: 'out/',
      access_key: key.access_key_id,
      secret_key: key.secret_access_key,
    },
  },
  outputs: [
    { type: 'file', codec: 'h264', height: 720, container: 'mp4' },
    { type: 'thumbnails' },
  ],
  idempotency_key: 'video-42',
});

// Poll until completed, failed or canceled
const current = await client.transcoder.getJob(job.uuid);
const files = await client.transcoder.getJobOutputs(job.uuid);

// Many inputs at once, list, cancel
const batch = await client.transcoder.createBatch({
  output: { s3: { bucket: 'my-videos', path: 'hls/' } },
  outputs: [{ type: 'hls' }],
  inputs: [{ url: 'https://example.com/a.mp4', out_subpath: 'a/' }],
});
const page = await client.transcoder.listJobs({ batch_id: batch.batch_id, limit: 100 });
await client.transcoder.cancelJob(job.uuid);
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
// List DDoS attacks (empty when there are none)
const attacks = await client.ddos.listAttacks();
for (const attack of attacks) {
  console.log(`${attack.ip_address}: ${attack.status} (${attack.duration}s)`);
}

// Details and traffic graph of one attack
const details = await client.ddos.getAttackDetails(attacks[0].attack_id);
const graph = await client.ddos.getAttackTrafficGraph(attacks[0].attack_id);
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
