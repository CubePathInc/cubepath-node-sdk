// ── Client ──────────────────────────────────────────────────────────────────

export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
  aiGatewayBaseURL?: string;
  userAgent?: string;
  maxRetries?: number;
  retryWaitMin?: number;
  retryWaitMax?: number;
  rateLimit?: number;
  timeout?: number;
}

export interface APIErrorResponse {
  statusCode: number;
  message: string;
  detail?: string;
}

// ── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  /** Returned by create. */
  project_id?: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  vps: VPS[];
  networks: Network[];
  baremetals: Baremetal[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
}

/** Generic `{ detail }` answer of the API's action endpoints. */
export interface DetailResponse {
  detail: string;
}

// ── SSH Keys ────────────────────────────────────────────────────────────────

export interface SSHKey {
  id: string;
  name: string;
  ssh_key: string;
  fingerprint: string;
  key_type: string;
  created_at: string;
}

export interface CreateSSHKeyRequest {
  name: string;
  ssh_key: string;
}

export interface UpdateSSHKeyResponse {
  detail: string;
  sshkey: {
    id: number;
    name: string;
    ssh_key: string;
    fingerprint?: string | null;
    key_type?: string | null;
  };
}

// ── VPS ─────────────────────────────────────────────────────────────────────

export interface VPS {
  id: string;
  name: string;
  label?: string;
  project_id: string;
  status: string;
  user: string;
  plan: VPSPlan;
  template: VPSTemplate;
  location: Location;
  floating_ips?: string;
  ipv4: string;
  ipv6: string;
  network?: NetworkInfo;
  ssh_keys?: string[];
  created_at: string;
}

export interface VPSPlan {
  id: string;
  plan_name: string;
  cpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
  price_per_hour: number;
}

export interface VPSTemplate {
  id: string;
  template_name: string;
  os_name: string;
  version: string;
}

export interface VPSAppTemplate {
  app_name: string;
  version: string;
  recommended_plan: string;
  app_docs: string;
  app_wiki: string;
  license_type: string;
  description: string;
}

export interface VPSTemplatesResponse {
  operating_systems: VPSTemplate[];
  applications: VPSAppTemplate[];
}

export interface Location {
  id: string;
  location_name: string;
  description: string;
}

export interface NetworkInfo {
  id: string;
  name: string;
  assigned_ip: string;
}

export interface CreateVPSRequest {
  name: string;
  plan_name: string;
  template_name: string;
  location_name: string;
  label?: string;
  network_id?: string;
  ssh_key_ids?: number[];
  user?: string;
  password?: string;
  ipv4?: boolean;
  ipv6?: boolean;
  enable_backups?: boolean;
  custom_cloud_init?: string;
  firewall_group_ids?: string[];
  availability_group_uuid?: string;
}

export interface UpdateVPSRequest {
  name?: string;
  label?: string;
}

export interface TaskResponse {
  task_id?: string;
  message?: string;
  detail?: string;
}

export type VPSPowerAction = 'start_vps' | 'stop_vps' | 'restart_vps' | 'reset_vps';

export interface VPSPlanOption {
  plan_name: string;
  ram: number;
  cpu: number;
  storage: number;
  bandwidth: number;
  price_per_hour: number;
  /** 2 available, 1 out of stock. */
  status?: number;
}

export interface VPSPlansResponse {
  locations: Array<{
    location_name: string;
    description: string;
    clusters: Array<{
      cluster_name: string;
      type?: string;
      plans: VPSPlanOption[];
    }>;
  }>;
}

export interface VNCSession {
  /** Open it with a noVNC client within 5 minutes. */
  websocket_url: string;
  session_id: string;
  /** Pass `ticket` as the VNC (RFB) password. */
  vnc_info: { ticket: string };
}

// ── VPS Availability Groups ─────────────────────────────────────────────────

export interface AvailabilityGroup {
  uuid: string;
  project_id: number;
  name: string;
  description: string | null;
  /** Placement strategy; `spread` puts every VPS on a different host. */
  strategy: string;
  location_name: string;
  max_servers: number;
  vps_count?: number;
  vps_list?: Array<{ id: number; name: string; label: string; status: string }>;
  created_at: string;
}

export interface CreateAvailabilityGroupRequest {
  project_id: number;
  name: string;
  description?: string;
  location_name: string;
}

export interface CreateAvailabilityGroupResponse {
  detail: string;
  uuid: string;
  project_id: number;
  name: string;
  description: string;
  strategy: string;
  location_name: string;
  max_servers: number;
  vps_count: number;
}

export interface AvailabilityGroupMemberResponse {
  detail: string;
  vps_id: number;
  vps_name: string;
  group_uuid?: string;
  group_name?: string;
}

// ── VPS Backups ─────────────────────────────────────────────────────────────

export interface VPSBackup {
  id: string;
  vps_id?: number;
  /** manual or automatic */
  backup_type: string;
  /** pending, in_progress, completed, failed or deleted */
  status: string;
  progress: number;
  size_gb: number | null;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface ListVPSBackupsParams {
  limit?: number;
  offset?: number;
}

export interface VPSBackupSettings {
  enabled: boolean;
  schedule_hour: number;
  retention_days: number;
  max_backups: number;
}

export interface CreateVPSBackupRequest {
  notes?: string;
}

export interface UpdateVPSBackupSettingsRequest {
  enabled: boolean;
  schedule_hour: number;
  retention_days: number;
  max_backups: number;
}

// ── VPS ISOs ────────────────────────────────────────────────────────────────

export interface ISO {
  id: string;
  name: string;
  file_size: number;
  is_mounted: boolean;
}

export interface ISOListResponse {
  items: ISO[];
  mounted_iso_id?: string;
}

// ── Baremetal ───────────────────────────────────────────────────────────────

export interface Baremetal {
  id: string;
  hostname: string;
  label?: string;
  project_id: string;
  status: string;
  user: string;
  os: OSInfo;
  location: Location;
  baremetal_model: BaremetalModel;
  floating_ips?: string[];
  monitoring_enable: boolean;
  ssh_username: string;
  ssh_key?: SSHKeyRef;
  created_at: string;
}

export interface BaremetalModel {
  id: string;
  model_name: string;
  cpu: number;
  cpu_specs: string;
  cpu_bench: number;
  ram: number;
  ram_size: string;
  ram_type: string;
  storage_type: string;
  disk_count: number;
  disk_size: string;
  disk_type: string;
  port: string;
  kvm: boolean;
  price: number;
}

export interface OSInfo {
  id: string;
  name: string;
  version: string;
}

export interface SSHKeyRef {
  name: string;
}

export interface CreateBaremetalRequest {
  model_name: string;
  location_name: string;
  hostname: string;
  label?: string;
  user?: string;
  password: string;
  ssh_key_ids?: number[];
  os_name?: string;
  disk_layout_name?: string;
}

export interface UpdateBaremetalRequest {
  hostname?: string;
  label?: string;
  tags?: string[];
}

export interface ReinstallBaremetalRequest {
  os_name: string;
  disk_layout_name?: string;
  user?: string;
  password: string;
  hostname?: string;
  ssh_key_ids?: number[];
}

export interface RescueResponse {
  detail: string;
  username: string;
  password: string;
}

export interface BMCSensors {
  /** @deprecated No longer returned by the API; always an empty string. */
  node: string;
  /** false when the BMC has not been polled recently (see last_seen). */
  ipmi_available: boolean;
  power_on: boolean;
  /** Unix time of the last BMC poll, null when never polled. */
  last_seen: number | null;
  sensors: {
    temperatures: SensorReading[];
    fans: SensorReading[];
  };
}

export interface SensorReading {
  name: string;
  value: number;
  /** CELSIUS for temperatures, RPM for fans. */
  unit: string;
}

export interface IPMISession {
  proxy_url: string;
  credentials: {
    username: string;
    password: string;
  };
}

export interface ReinstallStatus {
  is_reinstalling: boolean;
  status: string;
  /** @deprecated No longer available; always an empty string. */
  os_name: string;
}

export type BaremetalPowerAction = 'start_metal' | 'stop_metal' | 'restart_metal';

export interface BaremetalKVM {
  url: string;
  username: string;
  password?: string | null;
  updated_at?: string | null;
}

export interface BaremetalDiskLayout {
  id: number;
  name: string;
  disk_layout_name: string;
  disk_type?: string | null;
  raid_type?: string | null;
  disk_count?: number | null;
}

export interface BaremetalOSOption {
  id: number;
  os_name: string;
  operating_system?: string | null;
  disk_layouts: BaremetalDiskLayout[];
}

export interface BaremetalModelOption {
  model_name: string;
  price: number;
  discount_value: number;
  discount_type?: string | null;
  cpu: string;
  cpu_specs: string;
  cpu_bench?: number | null;
  ram_size: number;
  ram_type: string;
  disk_size: string;
  disk_type?: string | null;
  port: number;
  setup: number;
  kvm: string;
  stock_available: number;
}

export interface BaremetalModelsResponse {
  locations: Array<{
    location_name: string;
    description: string;
    models: BaremetalModelOption[];
  }>;
}

// ── Networks ────────────────────────────────────────────────────────────────

export interface Network {
  id: string;
  name: string;
  label?: string;
  project_id: string;
  location_name: string;
  ip_range: string;
  prefix: number;
  created_at: string;
}

export interface CreateNetworkRequest {
  name: string;
  location_name: string;
  ip_range: string;
  prefix: number;
  project_id: string;
  label?: string;
}

export interface UpdateNetworkRequest {
  name?: string;
  label?: string;
}

export interface NetworkRoute {
  id: string;
  network_id: number;
  destination: string;
  next_hop_type: 'ip' | 'vps' | 'baremetal';
  next_hop_target: string;
  resolved_next_hop_ip?: string;
  description?: string;
  created_at: string;
}

export interface CreateNetworkRouteRequest {
  destination: string;
  next_hop_type: 'ip' | 'vps' | 'baremetal';
  next_hop_target: string;
  description?: string;
}

export type BGPPeerType = 'ip' | 'vps' | 'baremetal';

export interface BGPPeer {
  id: string;
  network_id: number;
  peer_type: BGPPeerType;
  /** A private IP of the network, or the id of a VPS / baremetal attached to it. */
  peer_target: string;
  remote_asn: number;
  max_prefix: number;
  description?: string | null;
  enabled: boolean;
  created_at: string;
  resolved_peer_ip?: string | null;
  /** Session state reported by the network's routers, e.g. Established. */
  last_state?: string | null;
  prefixes_received?: number | null;
  last_state_at?: string | null;
  received_prefixes?: string[];
}

export interface CreateBGPPeerRequest {
  peer_type: BGPPeerType;
  peer_target: string;
  remote_asn: number;
  max_prefix?: number;
  description?: string;
}

export interface CreateBGPPeerResponse {
  detail: string;
  peer_id: string;
  peer_type: string;
  peer_target: string;
  remote_asn: number;
}

export interface UpdateBGPPeerRequest {
  max_prefix?: number;
  description?: string;
  enabled?: boolean;
}

// ── Floating IPs ────────────────────────────────────────────────────────────

export interface FloatingIP {
  id: string;
  address: string;
  type: string;
  status: string;
  is_primary: boolean;
  location_name: string;
  protection_type: string;
  vps_name?: string;
  baremetal_name?: string;
}

export interface Subnet {
  prefix: string;
  protection_type: string;
  ip_addresses: FloatingIP[];
}

export interface FloatingIPsResponse {
  single_ips: FloatingIP[];
  subnets: Subnet[];
}

// ── Firewall ────────────────────────────────────────────────────────────────

export interface FirewallGroup {
  id: string;
  project_id: string;
  name: string;
  rules: FirewallRule[];
  enabled: boolean;
  vps_count?: number;
}

export interface FirewallRule {
  /** in or out */
  direction: string;
  /** tcp, udp, icmp or gre */
  protocol: string;
  port?: string;
  source?: string;
  comment?: string;
}

export interface CreateFirewallGroupRequest {
  /** Project the group belongs to (required; sent as a query parameter). */
  project_id: number | string;
  name: string;
  rules: FirewallRule[];
  enabled: boolean;
}

export interface UpdateFirewallGroupRequest {
  name?: string;
  rules?: FirewallRule[];
  enabled?: boolean;
}

export interface VPSFirewallGroupsRequest {
  firewall_group_ids: string[];
}

export interface VPSFirewallGroupsResponse {
  detail: string;
  /** @deprecated The API returns `detail`. */
  message?: string;
  vps_id: string;
  firewall_groups: string[];
  sync_task_created: boolean;
}

// ── DNS ─────────────────────────────────────────────────────────────────────

export interface DNSZone {
  uuid: string;
  domain: string;
  status: string;
  records_count: number;
  nameservers: string[];
  project_id?: string;
  created_at: string;
}

export interface DNSRecord {
  uuid: string;
  zone_uuid: string;
  name: string;
  record_type: string;
  type: string;
  content: string;
  ttl: number;
  priority?: number;
  weight?: number;
  port?: number;
  comment?: string;
}

export interface SOARecord {
  primary_ns: string;
  hostmaster: string;
  serial: number;
  refresh: number;
  retry: number;
  expire: number;
  minimum: number;
}

export interface ZoneVerifyResponse {
  verified: boolean;
  message: string;
  next_check_at?: string;
}

export interface ZoneScanResponse {
  imported: number;
  skipped: number;
  errors: string[];
  records: DNSRecord[];
}

export interface CreateDNSZoneRequest {
  domain: string;
  project_id?: string;
}

export interface CreateDNSRecordRequest {
  name: string;
  record_type: string;
  content: string;
  ttl: number;
  priority?: number;
  weight?: number;
  port?: number;
  comment?: string;
}

export interface UpdateDNSRecordRequest {
  name?: string;
  content?: string;
  ttl?: number;
  priority?: number;
}

export interface UpdateSOARequest {
  refresh?: number;
  retry?: number;
  expire?: number;
  minimum?: number;
  hostmaster?: string;
}

export interface DNSRegion {
  code: string;
  name: string;
}

export type DNSHealthCheckType = 'http' | 'https' | 'tcp' | 'ping';

export interface DNSHealthCheck {
  uuid: string;
  record_uuid: string;
  name: string;
  check_type: DNSHealthCheckType;
  target?: string | null;
  port?: number | null;
  path?: string | null;
  expected_status?: number | null;
  interval_secs: number;
  timeout_secs: number;
  healthy_threshold: number;
  unhealthy_threshold: number;
  enabled: boolean;
  /** healthy, unhealthy or unknown */
  last_status: string;
  last_check_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Health checks need a Pro or Business zone and an A or AAAA record. */
export interface UpsertDNSHealthCheckRequest {
  name: string;
  check_type: DNSHealthCheckType;
  /** Bare hostname or IP to probe; defaults to the record's own value. */
  target?: string;
  /** Required for tcp. */
  port?: number;
  /** http and https only; starts with "/". */
  path?: string;
  expected_status?: number;
  interval_secs?: number;
  timeout_secs?: number;
  healthy_threshold?: number;
  unhealthy_threshold?: number;
  enabled?: boolean;
}

export interface DNSImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  records: DNSRecord[];
}

// ── Load Balancer ───────────────────────────────────────────────────────────

export interface LoadBalancer {
  uuid: string;
  name: string;
  label?: string;
  status: string;
  location_name: string;
  plan: LBPlan;
  plan_name: string;
  floating_ips: LBFloatingIP[];
  listeners: LBListener[];
  listeners_count: number;
  project_id?: string;
  created_at: string;
}

export interface LBPlan {
  name: string;
  price_per_hour: number;
  price_per_month: number;
  max_listeners: number;
  max_targets: number;
  connections_per_second: number;
}

export interface LBFloatingIP {
  address: string;
  type: string;
}

export interface LBListener {
  uuid: string;
  name: string;
  protocol: string;
  source_port: number;
  target_port: number;
  algorithm: string;
  sticky_sessions: boolean;
  enabled: boolean;
  targets: LBTarget[];
  targets_count: number;
  health_check?: Record<string, unknown>;
}

export interface LBTarget {
  uuid: string;
  target_type: string;
  target_uuid: string;
  target_name: string;
  target_ip: string;
  port: number;
  weight: number;
  enabled: boolean;
  health_status: string;
}

export interface LBLocationPlans {
  location_name: string;
  description: string;
  plans: LBPlan[];
}

export interface HealthCheckConfig {
  protocol: string;
  path?: string;
  interval_seconds: number;
  timeout_seconds: number;
  healthy_threshold: number;
  unhealthy_threshold: number;
  expected_codes?: string;
}

export interface CreateLoadBalancerRequest {
  name: string;
  plan_name: string;
  location_name: string;
  project_id?: string;
  label?: string;
  network_id?: number;
}

export interface UpdateLoadBalancerRequest {
  name?: string;
  label?: string;
}

export interface CreateListenerRequest {
  name: string;
  protocol: string;
  source_port: number;
  target_port: number;
  algorithm: string;
  sticky_sessions: boolean;
}

export interface UpdateListenerRequest {
  name?: string;
  target_port?: number;
  algorithm?: string;
  enabled?: boolean;
}

export interface AddTargetRequest {
  target_type: string;
  target_uuid: string;
  port?: number;
  weight: number;
}

export interface UpdateTargetRequest {
  port?: number;
  weight?: number;
  enabled?: boolean;
}

export interface BatchTargetRequest {
  /** vps, baremetal or availability_group */
  target_type: string;
  target_uuid: string;
  port?: number;
  weight?: number;
  enabled?: boolean;
}

export interface AddTargetsResponse {
  detail: string;
  targets?: Array<{ uuid: string; target_type: string; target_uuid: string; target_name?: string | null }>;
}

// ── CDN ─────────────────────────────────────────────────────────────────────

export interface CDNZone {
  uuid: string;
  name: string;
  domain: string;
  custom_domain?: string;
  status: string;
  plan_name: string;
  ssl_type?: string;
  project_id?: string;
  origins: CDNOrigin[];
  rules: CDNRule[];
  token_auth_enabled?: boolean;
  token_auth_ip_binding?: boolean;
  cors_enabled?: boolean;
  cors_allow_origins?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CDNOrigin {
  uuid: string;
  name: string;
  address: string;
  port: number;
  protocol: string;
  weight: number;
  priority: number;
  is_backup: boolean;
  health_check_enabled: boolean;
  health_check_path?: string;
  health_status?: string;
  verify_ssl: boolean;
  host_header?: string;
  base_path?: string;
  enabled: boolean;
  /** Set when the origin serves a CubePath Object Storage bucket. */
  object_storage_bucket_uuid?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CDNRule {
  uuid: string;
  name: string;
  rule_type: string;
  priority: number;
  match_conditions?: Record<string, unknown>;
  action_config: Record<string, unknown>;
  enabled: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CDNPlan {
  uuid: string;
  name: string;
  description: string;
  price_per_gb: Record<string, unknown>;
  base_price_per_hour: number;
  max_zones: number;
  max_origins_per_zone: number;
  max_rules_per_zone: number;
  custom_ssl_allowed: boolean;
}

export interface CDNMetricsParams {
  minutes?: number;
  interval_seconds?: number;
  group_by?: string;
  limit?: number;
  /** Filters (not every metric accepts the dimension it breaks down). CSV of ISO codes. */
  country?: string;
  /** CSV of AS numbers. */
  asn?: string;
  /** CSV of status codes; wins over status_range. */
  status?: string;
  /** 2xx, 3xx, 4xx or 5xx */
  status_range?: string;
  /** HIT or MISS */
  cache_status?: string;
  /** mobile, desktop or bot */
  device_type?: string;
  path_prefix?: string;
}

export interface CreateCDNZoneRequest {
  name: string;
  plan_name: string;
  custom_domain?: string;
  project_id?: string;
}

export interface UpdateCDNZoneRequest {
  name?: string;
  custom_domain?: string;
  ssl_type?: string;
  certificate_uuid?: string;
  /** Enabling it returns the new secret once as token_auth_secret. */
  token_auth_enabled?: boolean;
  /** Bind signed URLs to the client IP. */
  token_auth_ip_binding?: boolean;
  cors_enabled?: boolean;
  cors_allow_origins?: string;
}

/** The API answers a message, plus the new secret when token auth gets enabled. */
export interface CDNZoneUpdateResponse extends Partial<CDNZone> {
  detail?: string;
  /** Shown only once. */
  token_auth_secret?: string | null;
}

/** Either `everything: true`, or up to 100 paths ("/img/*" purges a prefix). */
export interface CDNPurgeRequest {
  everything?: boolean;
  paths?: string[];
}

export interface CDNPurgeResponse {
  detail: string;
  purge_uuid: string;
  /** pending, in_progress, completed, partial, failed or expired */
  status: string;
}

export interface CDNPurgeProgress {
  expected: number;
  completed: number;
  failed: number;
}

export interface CDNPurge {
  purge_uuid: string;
  /** everything or paths */
  scope: string;
  paths: string[];
  status: string;
  requested_at?: string | null;
  completed_at?: string | null;
  nodes: CDNPurgeProgress;
  pops: Array<CDNPurgeProgress & { pop: string }>;
}

export interface CDNTokenSecretResponse {
  detail: string;
  /** Shown only once. */
  token_auth_secret: string;
}

export interface CDNSignURLRequest {
  /** Path (or full URL; only the path is signed). */
  path: string;
  /** Seconds, 60 to 604800 (default 3600). */
  expires_in?: number;
  /** Required when the zone binds tokens to the client IP. */
  client_ip?: string;
}

export interface CDNSignedURL {
  detail: string;
  signed_url: string;
  token: string;
  /** Unix time. */
  expires: number;
}

/**
 * Either an external origin (origin_url or address) or a CubePath Object Storage bucket
 * (object_storage_bucket_uuid). A bucket origin only accepts name, weight, priority and
 * is_backup next to the bucket uuid: the API sets every connection field itself.
 */
export interface CreateCDNOriginRequest {
  name: string;
  origin_url?: string;
  address?: string;
  port?: number;
  protocol?: string;
  weight?: number;
  priority?: number;
  is_backup?: boolean;
  health_check_enabled?: boolean;
  health_check_path?: string;
  verify_ssl?: boolean;
  host_header?: string;
  base_path?: string;
  enabled?: boolean;
  object_storage_bucket_uuid?: string;
}

export interface UpdateCDNOriginRequest {
  name?: string;
  address?: string;
  port?: number;
  protocol?: string;
  weight?: number;
  priority?: number;
  host_header?: string;
  base_path?: string;
  health_check_enabled?: boolean;
  health_check_path?: string;
  verify_ssl?: boolean;
  enabled?: boolean;
}

export interface CreateCDNRuleRequest {
  name: string;
  rule_type: string;
  priority: number;
  match_conditions?: Record<string, unknown>;
  action_config: Record<string, unknown>;
  enabled: boolean;
}

export interface UpdateCDNRuleRequest {
  name?: string;
  priority?: number;
  match_conditions?: Record<string, unknown>;
  action_config?: Record<string, unknown>;
  enabled?: boolean;
}

export type CDNMetricType =
  | 'summary'
  | 'requests'
  | 'bandwidth'
  | 'cache'
  | 'status-codes'
  | 'top-urls'
  | 'top-countries'
  | 'top-asn'
  | 'top-user-agents'
  | 'blocked'
  | 'pops'
  | 'file-extensions';

// ── Kubernetes ──────────────────────────────────────────────────────────────

export interface KubernetesVersion {
  version: string;
  is_default: boolean;
  min_cpu: number;
  min_ram_mb: number;
}

export interface KubernetesPlan {
  id: string;
  name: string;
  cpu: number;
  ram: number;
  storage: number;
  price_per_hour: number;
}

export interface KubernetesCluster {
  uuid: string;
  name: string;
  label?: string;
  status: string;
  version: string;
  ha_control_plane: boolean;
  api_endpoint: string;
  pod_cidr: string;
  service_cidr: string;
  billing_type: string;
  location: KubernetesLocation;
  network?: KubernetesNetwork;
  node_pools: NodePool[];
  worker_count: number;
  node_pool_count: number;
  created_at: string;
}

export interface KubernetesLocation {
  location_name: string;
  description: string;
}

export interface KubernetesNetwork {
  name: string;
  ip_range: string;
  prefix: number;
}

export interface NodePool {
  uuid: string;
  name: string;
  desired_nodes: number;
  min_nodes: number;
  max_nodes: number;
  auto_scale: boolean;
  plan: NodePoolPlan;
  nodes: Node[];
}

export interface NodePoolPlan {
  name: string;
}

export interface Node {
  vps_name: string;
  vps_status: string;
  k8s_status: string;
  floating_ip?: string;
  private_ip?: string;
}

export interface KubernetesAddon {
  name: string;
  slug: string;
  description: string;
  category: string;
  helm_repo_name: string;
  helm_repo_url: string;
  helm_chart: string;
  default_version: string;
  namespace: string;
  icon_url?: string;
  documentation_url?: string;
  keywords?: string[];
  min_k8s_version?: string;
}

export interface InstalledAddon {
  uuid: string;
  status: string;
  installed_version: string;
  addon: {
    name: string;
    slug: string;
  };
  installed_at: string;
}

export interface KubernetesLB {
  uuid: string;
  name: string;
  status: string;
  floating_ip_address: string;
}

export interface KubernetesClusterResponse {
  detail?: string;
  uuid?: string;
}

export interface NodePoolResponse {
  detail?: string;
  uuid?: string;
}

export interface CreateKubernetesClusterRequest {
  project_id: string;
  name: string;
  location_name: string;
  version?: string;
  ha_control_plane: boolean;
  node_pools: CreateNodePoolConfig[];
  network?: ClusterNetworkConfig;
  allocate_ipv4?: boolean;
  allocate_ipv6?: boolean;
}

export interface CreateNodePoolConfig {
  name: string;
  plan: string;
  count: number;
}

export interface ClusterNetworkConfig {
  network_id?: string;
  node_cidr?: string;
  pod_cidr?: string;
  service_cidr?: string;
}

export interface UpdateKubernetesClusterRequest {
  name?: string;
  label?: string;
}

export interface CreateNodePoolRequest {
  name: string;
  plan: string;
  count: number;
  auto_scale: boolean;
  labels?: Record<string, string>;
  taints?: NodeTaint[];
}

export interface NodeTaint {
  key: string;
  value: string;
  effect: string;
}

export interface UpdateNodePoolRequest {
  name?: string;
  desired_nodes?: number;
  min_nodes?: number;
  max_nodes?: number;
  auto_scale?: boolean;
  labels?: Record<string, string>;
  taints?: NodeTaint[];
}

export interface InstallAddonRequest {
  custom_values?: Record<string, unknown>;
}

/** 1h (default), 3h, 6h, 12h, 24h, 3d, 7d or 30d. */
export type KubernetesMetricsTimeRange = '1h' | '3h' | '6h' | '12h' | '24h' | '3d' | '7d' | '30d';

export interface KubernetesMetrics {
  start: number;
  end: number;
  step: number;
  /** Series name to [unix time, value] pairs. */
  metrics: Record<string, Array<[number, number]>>;
}

// ── Pricing ─────────────────────────────────────────────────────────────────

export interface PricingResponse {
  vps: VPSPricing;
  baremetal?: BaremetalPricing;
}

export interface VPSPricing {
  locations: LocationPricing[];
  templates: VPSTemplate[];
}

export interface LocationPricing {
  location_name: string;
  description: string;
  clusters: PricingCluster[];
}

export interface PricingCluster {
  cluster_name: string;
  plans: VPSPlan[];
}

export interface BaremetalPricing {
  locations: BaremetalLocationPricing[];
}

export interface BaremetalLocationPricing {
  location_name: string;
  description: string;
  baremetal_models: BaremetalModelPrice[];
}

export interface BaremetalModelPrice {
  model_name: string;
  cpu: number;
  cpu_specs: string;
  ram_size: string;
  ram_type: string;
  disk_size: string;
  disk_type: string;
  port: string;
  price: number;
  setup: number;
  stock_available: boolean;
}

// ── DDoS ────────────────────────────────────────────────────────────────────

export interface DDoSAttack {
  attack_id: number;
  ip_address: string;
  start_time: string;
  duration: number | null;
  packets_second_peak: number | null;
  gbps_peak?: number | null;
  /** @deprecated Not returned by the API; see gbps_peak. */
  bytes_second_peak?: number;
  status: string | null;
  description: string | null;
}

// ── AI Gateway ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: string;
  content: unknown;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: string;
  function: FunctionCall;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface Tool {
  type: string;
  function: ToolFunction;
}

export interface ToolFunction {
  name: string;
  description?: string;
  parameters?: unknown;
}

export interface ChatCompletionRequest {
  /** Model in "provider/model_id" format, e.g. "openai/gpt-4o". */
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  user?: string;
  tools?: Tool[];
  tool_choice?: unknown;
  response_format?: Record<string, unknown>;
}

export interface CompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: CompletionUsage;
}

export interface DeltaContent {
  role?: string;
  content?: string;
  tool_calls?: ToolCall[];
}

export interface ChatCompletionDelta {
  index: number;
  delta: DeltaContent;
  finish_reason: string | null;
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionDelta[];
  usage?: CompletionUsage;
}

export interface ModelPricing {
  input_per_million_tokens: string;
  output_per_million_tokens: string;
  currency: string;
}

export interface ModelCapabilities {
  streaming: boolean;
  vision: boolean;
  tools: boolean;
}

export interface ModelLimits {
  max_context_tokens: number;
  max_output_tokens: number;
}

export interface ModelInfo {
  id: string;
  object: string;
  owned_by: string;
  pricing: ModelPricing;
  capabilities: ModelCapabilities;
  limits: ModelLimits;
}

export interface ModelListResponse {
  object: string;
  data: ModelInfo[];
}

// ── NAT Gateway ─────────────────────────────────────────────────────────────

export interface NATGatewayPlan {
  name: string;
  description?: string;
  price_per_hour: number;
  bandwidth_mbps: number;
  connections_per_second: number;
}

export interface NATGatewayLocationPlans {
  location_name: string;
  location_description: string;
  plans: NATGatewayPlan[];
}

export interface NATGatewayFloatingIP {
  address: string;
  netmask?: string;
  type: string;
  rdns?: string;
}

export interface NATGateway {
  uuid: string;
  name: string;
  label?: string;
  status: string;
  plan_name: string;
  location_name: string;
  project_id: number;
  project_name?: string;
  network_id: number;
  network_name?: string;
  network_cidr?: string;
  private_ip?: string;
  monthly_charges?: number;
  floating_ips?: NATGatewayFloatingIP[];
  protected: boolean;
  created_at: string;
}

export interface CreateNATGatewayRequest {
  name: string;
  label?: string;
  plan_name: string;
  network_id: number;
  project_id?: number;
}

export interface UpdateNATGatewayRequest {
  name?: string;
  label?: string;
}

// ── Object Storage ──────────────────────────────────────────────────────────

export interface ObjectStorageTierSummary {
  uuid: string;
  slug: string;
  name: string;
  media: string;
}

export interface ObjectStorageTier extends ObjectStorageTierSummary {
  location_id: number;
  location_name: string;
  location_description?: string;
  region: string;
  endpoint: string;
  prices: {
    storage_gb_month: number;
    egress_gb: number;
    class_a_per_1k: number;
    class_b_per_1k: number;
  };
  free_tier: {
    storage_gb_month: number;
    egress_gb: number;
    requests: number;
  };
  accepting_new: boolean;
}

export interface ObjectStorageBucket {
  uuid: string;
  name: string;
  /** pending, active, suspended, blocked, error or deleting */
  status: string;
  suspend_reason?: string | null;
  write_blocked: boolean;
  error_message?: string | null;
  project_id: number | null;
  tier: ObjectStorageTierSummary;
  location_name: string;
  region: string;
  endpoint: string;
  /** off, enabled or suspended */
  versioning: string;
  protected: boolean;
  size_bytes: number;
  objects_count: number;
  usage_updated_at: string | null;
  monthly_charges: number;
  cdn_connected: boolean;
  /** Object Lock state: chosen when the bucket is created, never added later. */
  object_lock: ObjectStorageObjectLock;
  /**
   * The last delete left versions protected by Object Lock (retention or legal hold): the
   * bucket stays and keeps being billed until they expire. Cleared by the next delete.
   */
  locked_content_kept: boolean;
  /** Encryption at rest (SSE-S3); null until the bucket default is applied. */
  encryption?: ObjectStorageBucketEncryption | null;
}

/**
 * Encryption at rest of a bucket. scope new_objects: objects written before the bucket default
 * may still be stored unencrypted (older buckets until they are re-encrypted).
 */
export interface ObjectStorageBucketEncryption {
  algorithm: 'AES256';
  scope: 'all_objects' | 'new_objects';
}

/**
 * An Object Lock default retention. governance: keys with bypass_governance can still delete
 * early; compliance: nobody can delete or shorten it before the date. Set exactly one of days
 * or years.
 */
export interface ObjectStorageLockRetention {
  mode: 'governance' | 'compliance';
  days?: number | null;
  years?: number | null;
}

export interface ObjectStorageObjectLock {
  enabled: boolean;
  /** Null when the bucket has no default retention. */
  default_retention: ObjectStorageLockRetention | null;
}

export interface ObjectStorageBucketUsage {
  period: string;
  since: string;
  until: string;
  storage_gib_hours: number;
  storage_gib_month: number;
  egress_bytes: number;
  cdn_bytes: number;
  class_a_requests: number;
  class_b_requests: number;
  class_b_cdn_requests: number;
}

export interface ObjectStorageBucketCDN {
  /** connecting, connected, disconnecting, error or disconnected */
  status: string;
  zone_uuid: string;
  zone_name: string;
  domain: string;
  custom_domain: string | null;
  zone_status: string;
  origin_uuid: string;
  origin_enabled: boolean;
}

export interface ObjectStorageBucketDetail extends ObjectStorageBucket {
  active_at: string | null;
  last_billed_time: string | null;
  connection: {
    endpoint: string;
    region: string;
    path_style_url: string;
    virtual_host_url: string;
  };
  /** Null when usage metrics are temporarily unavailable. */
  usage: ObjectStorageBucketUsage | null;
  /** Null when no CDN origin serves the bucket. */
  cdn: ObjectStorageBucketCDN | null;
}

export interface ListObjectStorageParams {
  project_id?: number;
  /** Tier uuid or slug. */
  tier?: string;
}

export interface CreateObjectStorageBucketRequest {
  name: string;
  /** Tier uuid or slug, for example "infrequent_access". */
  tier: string;
  project_id?: number;
  /** Do not send false together with object_lock: Object Lock implies versioning. */
  versioning?: boolean;
  /**
   * Create the bucket with Object Lock (WORM). Only possible now, never later. The bucket keeps
   * versioning enabled and is created with deletion protection on.
   */
  object_lock?: boolean;
  /** Default retention of new objects (only with object_lock). */
  object_lock_default?: ObjectStorageLockRetention | null;
  /** Must be true with object_lock: you accept the Object Lock terms. */
  accept_object_lock_terms?: boolean;
}

export interface SetObjectStorageObjectLockRequest {
  /** The new default retention, or null to remove it (a compliance rule can only be kept or lengthened). */
  default_retention: ObjectStorageLockRetention | null;
  /** Required (true) when the change turns compliance on or lengthens the retention. */
  accept_object_lock_terms?: boolean;
}

export interface DeleteObjectStorageBucketOptions {
  /** Purge every object and version first. */
  force?: boolean;
  /**
   * With force, on a bucket with Object Lock: also delete the versions under governance
   * retention. Versions under compliance or a legal hold are always kept.
   */
  bypass_governance?: boolean;
}

export interface CreateObjectStorageBucketResponse {
  detail: string;
  uuid: string;
  name: string;
  status: string;
  project_id: number;
  tier: ObjectStorageTierSummary;
  region: string;
  endpoint: string;
  object_lock: ObjectStorageObjectLock;
}

export interface UpdateObjectStorageBucketRequest {
  /** enabled or suspended */
  versioning?: string;
  protected?: boolean;
}

export interface ObjectStorageBucketScope {
  uuid: string;
  name: string;
}

export interface ObjectStorageAccessKey {
  uuid: string;
  name: string;
  access_key_id: string;
  /** read_write or read_only */
  permission: string;
  /** Null means every bucket of the project in the key's tier. */
  bucket_scope: ObjectStorageBucketScope[] | null;
  project_id: number | null;
  tier: ObjectStorageTierSummary;
  region: string;
  endpoint: string;
  /** pending, active, suspended, error or deleting */
  status: string;
  expires_at: string | null;
  /** read_write keys only: may delete versions under governance retention. */
  bypass_governance: boolean;
}

export interface CreateObjectStorageAccessKeyRequest {
  name: string;
  /** Tier uuid or slug. */
  tier: string;
  /** read_write or read_only */
  permission: string;
  project_id?: number;
  /** Limit the key to these buckets; omit for every bucket of the project in the tier. */
  bucket_uuids?: string[];
  /** ISO 8601 date time in the future. */
  expires_at?: string;
  /**
   * read_write keys only: the key may delete versions under governance retention (sending
   * x-amz-bypass-governance-retention: true). Cannot be changed later.
   */
  bypass_governance?: boolean;
}

export interface CreateObjectStorageAccessKeyResponse extends ObjectStorageAccessKey {
  detail: string;
  /** Returned only once, on creation. */
  secret_access_key: string;
}

export interface ObjectStorageFreeTierItem {
  included: number;
  used: number | null;
}

export interface ObjectStorageTierUsage {
  tier: ObjectStorageTierSummary;
  storage_gib_hours: number | null;
  storage_gib_month: number | null;
  egress_bytes: number | null;
  cdn_bytes: number | null;
  class_a_requests: number | null;
  class_b_requests: number | null;
  class_b_cdn_requests: number | null;
  cost: number;
  projected_cost: number;
  free_tier: {
    storage_gb_month: ObjectStorageFreeTierItem;
    egress_gb: ObjectStorageFreeTierItem;
    requests: ObjectStorageFreeTierItem;
  };
}

export interface ObjectStorageBucketUsageRow {
  uuid: string;
  name: string;
  status: string;
  project_id: number | null;
  tier_uuid: string;
  storage_gib_hours: number | null;
  storage_gib_month: number | null;
  egress_bytes: number | null;
  cdn_bytes: number | null;
  class_a_requests: number | null;
  class_b_requests: number | null;
  class_b_cdn_requests: number | null;
  cost: number;
}

export interface ObjectStorageUsage {
  period: string;
  since: string;
  until: string;
  metrics_available: boolean;
  total_cost: number;
  projected_cost: number;
  tiers: ObjectStorageTierUsage[];
  buckets: ObjectStorageBucketUsageRow[];
  available_months: string[];
}

export interface ObjectStorageUsageParams extends ListObjectStorageParams {
  /** YYYY-MM, default the current month. */
  period?: string;
}

export interface ObjectStorageLifecycleTag {
  key: string;
  value: string;
}

/** Limits a rule to part of the bucket; absent fields mean the whole bucket. */
export interface ObjectStorageLifecycleFilter {
  /** A leading "/" is removed by the API. */
  prefix?: string | null;
  tags?: ObjectStorageLifecycleTag[] | null;
  object_size_greater_than?: number | null;
  object_size_less_than?: number | null;
}

/**
 * One lifecycle rule. id: 1 to 64 letters, numbers, dots, hyphens and underscores, unique,
 * not starting with "cubepath-". At least one action.
 */
export interface ObjectStorageLifecycleRule {
  id: string;
  enabled: boolean;
  filter?: ObjectStorageLifecycleFilter | null;
  /** days (1 to 36500), date ("YYYY-MM-DD", after today UTC) or expired_object_delete_marker. */
  expiration?: { days?: number | null; date?: string | null; expired_object_delete_marker?: boolean | null } | null;
  noncurrent_version_expiration?: { noncurrent_days: number; newer_noncurrent_versions?: number | null } | null;
  /** 1 to 7 days (incomplete uploads are aborted after 7 days anyway). */
  abort_incomplete_multipart_upload?: { days_after_initiation: number } | null;
}

export interface ObjectStorageLifecycle {
  bucket_uuid: string;
  /** none, pending, active, paused (bucket blocked or on hold) or error. */
  status: string;
  rules: ObjectStorageLifecycleRule[];
  platform_rules: Record<string, unknown>[];
  generation: number;
  /** The rules are applied once this reaches generation. */
  applied_generation: number;
  error: string | null;
  updated_at: string | null;
  notes: string[];
}

export interface ObjectStorageLifecycleChange {
  detail: string;
  /** Absent when nothing changed. */
  generation?: number;
  notes?: string[];
}

// ── Object Storage event notifications ──────────────────────────────────────

export type ObjectStorageEventType = 'object.created' | 'object.removed' | 'object.tagging';

/**
 * Where bucket events are delivered: a signed webhook or a Cloud Alerts channel (Slack or
 * Discord). The webhook URL is never returned in clear.
 */
export interface ObjectStorageEventDestination {
  uuid: string;
  name: string;
  type: 'webhook' | 'notificator';
  url_masked: string | null;
  notificator: { id: string; name: string; type: string } | null;
  payload_format: 'cubepath' | 's3';
  status: 'active' | 'disabled' | 'auto_disabled' | 'deleted';
  disabled_reason: 'user' | 'failing' | 'admin' | 'abuse' | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_error: string | null;
  rules_count: number;
}

/** Answer of create and rotate-secret, the only calls that return the signing secret. */
export interface ObjectStorageEventDestinationSecret {
  destination: ObjectStorageEventDestination;
  /** whsec_..., null for a channel destination. */
  signing_secret: string | null;
}

export interface CreateObjectStorageEventDestinationRequest {
  name: string;
  type: 'webhook' | 'notificator';
  /** Webhook URL (https). */
  url?: string | null;
  /** Cloud Alerts channel of a "notificator" destination. */
  notificator_id?: string | null;
  payload_format?: 'cubepath' | 's3';
}

export interface UpdateObjectStorageEventDestinationRequest {
  name?: string;
  url?: string;
  payload_format?: 'cubepath' | 's3';
  enabled?: boolean;
}

export interface ListObjectStorageEventDeliveriesParams {
  status?: 'success' | 'failed' | 'dead';
  limit?: number;
  /** Page back from this timestamp. */
  before?: string;
}

export type ObjectStorageEventDelivery = Record<string, unknown>;

export interface ObjectStorageEventRule {
  uuid: string;
  name: string;
  bucket_uuid: string;
  destination: { uuid: string; name: string; type: 'webhook' | 'notificator' };
  events: ObjectStorageEventType[];
  prefix: string;
  suffix: string;
  enabled: boolean;
  /** "pending" until applied to the bucket, then "active". */
  status: 'pending' | 'active' | 'error' | 'deleted';
  error_message: string | null;
}

export interface CreateObjectStorageEventRuleRequest {
  name: string;
  destination_uuid: string;
  events: ObjectStorageEventType[];
  prefix?: string;
  suffix?: string;
  enabled?: boolean;
}

export type UpdateObjectStorageEventRuleRequest = Partial<CreateObjectStorageEventRuleRequest>;

// ── Metrics (GraphQL) ───────────────────────────────────────────────────────

export type MetricsTimeRange = 'H1' | 'H3' | 'H6' | 'H12' | 'H24' | 'D3' | 'D7' | 'D30';

export interface MetricPoint {
  /** Unix time. */
  ts: number;
  value: number;
}

export interface MetricSeries {
  name: string;
  unit: string;
  points: MetricPoint[];
}

export interface MetricsResult {
  start: number;
  end: number;
  step: number;
  series: MetricSeries[];
}

/**
 * Chart series of one Object Storage bucket (GraphQL `objectStorageBucket`). storage: size_bytes,
 * objects (hourly); traffic: egress_bytes, cdn_bytes, ingress_bytes, class_a_requests,
 * class_b_requests, free_requests; responses: responses_2xx, responses_3xx, responses_4xx,
 * responses_5xx, responses_429, responses_other. Traffic and responses are totals per step,
 * not rates.
 */
export interface ObjectStorageBucketMetrics {
  uuid: string;
  name: string;
  /** Unix time of the newest size sample, null before the first one. */
  storageMeasuredAt: number | null;
  storage: MetricsResult;
  traffic: MetricsResult;
  responses: MetricsResult;
}

export interface BandwidthUsage {
  inBytes: number;
  outBytes: number;
  totalBytes: number;
  periodStart: number;
  periodEnd: number;
}

// ── Managed Databases ───────────────────────────────────────────────────────

export type ManagedDatabaseEngine = 'mysql' | 'valkey' | 'postgresql';

export interface ManagedDatabasePlan {
  uuid: string;
  name: string;
  description?: string | null;
  engine: string;
  /** vCPU, memory and storage are per node (replica). */
  cpu: number;
  memory_gb: number;
  storage_gb: number;
  max_replicas: number;
  /** Per node per hour. */
  price_per_hour: number;
}

export interface ManagedDatabaseLocationPlans {
  location_name: string;
  location_description?: string | null;
  plans: ManagedDatabasePlan[];
}

export interface ManagedDatabaseSummary {
  uuid: string;
  project_id: number;
  name: string;
  label?: string | null;
  engine: string;
  version: string;
  /** provisioning, active, updating, scaling, backing_up, restoring, degraded, suspended, error or deleting */
  status: string;
  /** Null until the database is provisioned. */
  endpoint_host?: string | null;
  endpoint_port?: number | null;
  replicas: number;
  protected?: boolean;
}

export interface ManagedDatabase extends ManagedDatabaseSummary {
  topology: string;
  plan: ManagedDatabasePlan;
  location: { id: number; location_name: string; description?: string | null };
  backup_enabled?: boolean;
  backup_schedule_cron?: string | null;
  backup_retention_days?: number;
  billing_type: string;
  updated_at: string;
}

export interface CreateManagedDatabaseRequest {
  project_id: number;
  /** 2-60 chars: lowercase letters, digits and hyphens. */
  name: string;
  engine: ManagedDatabaseEngine;
  /** One of the supported versions of the engine, e.g. 8.0.39, 7.2.11 or 17.5.0. */
  version: string;
  /** The plan also sets the location. */
  plan_uuid: string;
  /** Default 3; at least 3 for mysql and 2 for valkey and postgresql. */
  replicas?: number;
  topology?: string;
  backup?: { schedule_cron: string; retention_days?: number };
}

export interface CreateManagedDatabaseResponse {
  detail: string;
  uuid: string;
  name: string;
  engine: string;
  version: string;
  status: string;
}

export interface UpdateManagedDatabaseRequest {
  name?: string;
  label?: string;
  backup?: { enabled?: boolean; schedule_cron?: string; retention_days?: number };
}

/** Exactly one of replicas (horizontal) or plan_uuid (vertical). */
export interface ScaleManagedDatabaseRequest {
  replicas?: number;
  plan_uuid?: string;
}

export interface ScaleManagedDatabaseResponse {
  detail: string;
  uuid: string;
  replicas?: number | null;
  plan?: string | null;
}

export interface ManagedDatabaseCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  /** Connection URI, e.g. mysql://user:pass@host:port. */
  uri: string;
}

export interface ManagedDatabaseConfigParam {
  /** int, float, enum or str */
  type: string;
  default: unknown;
  requires_restart: boolean;
  description: string;
  value: unknown;
  value_source: string;
  min?: number;
  max?: number;
  enum?: string[];
}

export interface ManagedDatabaseConfig {
  engine: string;
  params: Record<string, ManagedDatabaseConfigParam>;
  note: string;
}

export interface UpdateManagedDatabaseConfigResponse {
  detail: string;
  uuid: string;
  /** Parameters that trigger a brief rolling restart. */
  requires_restart: string[];
}

export interface ManagedDatabaseMetricsParams {
  /** Subset of connections, cpu, memory and replication_lag; default all. */
  metrics?: string[];
  /** 1h (default), 24h, 7d, 30d... */
  time_range?: string;
}

export interface ManagedDatabaseMetrics {
  start: number;
  end: number;
  metrics: Record<string, Array<[number, number]>>;
}

export interface ManagedDatabaseLogicalDatabase {
  uuid: string;
  name: string;
  /** pending, active, error or deleting */
  status: string;
  created_at?: string | null;
}

export interface CreateLogicalDatabaseResponse {
  detail: string;
  uuid: string;
  name: string;
  status: string;
}

export interface ManagedDatabaseUser {
  uuid: string;
  username: string;
  status: string;
  created_at?: string | null;
}

export interface CreateManagedDatabaseUserRequest {
  username: string;
  /** 12-64 chars; omit to have one generated. */
  password?: string;
}

export interface CreateManagedDatabaseUserResponse {
  detail: string;
  uuid: string;
  username: string;
  /** Returned only here: store it now. */
  password: string;
  status: string;
}

// ── DDoS Mitigation ─────────────────────────────────────────────────────────

export interface DDoSProtectedIP {
  network: string;
  /** IPv4 or IPv6 */
  ip_type: string;
  protection_type: string;
  location_name?: string | null;
  location_description?: string | null;
  has_profile?: boolean;
  firewall_rules_count?: number;
}

export interface DDoSProtectedSubnet extends DDoSProtectedIP {
  prefix: number;
  ip_addresses?: Array<{ address: string; has_profile?: boolean; firewall_rules_count?: number }>;
}

export interface DDoSIPList {
  single_ips: DDoSProtectedIP[];
  subnets: DDoSProtectedSubnet[];
  total: number;
}

export interface ListDDoSIPsParams {
  /** IPv4 or IPv6 */
  ip_type?: string;
  location?: string;
  has_profile?: boolean;
}

/**
 * Protection levels are 0-10 (0 = off). tcp_validation_level and tcp_validation_sym_level
 * are mutually exclusive. default_action: 0 FILTER, 1 ACCEPT, 2 DROP. The *_mode fields:
 * 0 off, 1 blacklist, 2 whitelist. Rate limits must be at least 1.
 */
export interface DDoSProtectionProfileSettings {
  tcp_validation_level?: number;
  tcp_validation_sym_level?: number;
  udp_validation_level?: number;
  invalid_filter_level?: number;
  fragmented_filter_level?: number;
  amplification_udp_level?: number;
  amplification_tcp_level?: number;
  icmp_rate_limit_level?: number;
  same_packet_size_level?: number;
  stateful_firewall_level?: number;
  default_action?: number;
  country_mode?: number;
  asn_mode?: number;
  prefix_list_mode?: number;
  udp_threshold_pps?: number;
  tcp_threshold_pps?: number;
  tcp_syn_threshold_pps?: number;
  tcp_ack_threshold_pps?: number;
  icmp_threshold_pps?: number;
  udp_threshold_mbps?: number;
  tcp_threshold_mbps?: number;
  tcp_syn_threshold_mbps?: number;
  tcp_ack_threshold_mbps?: number;
  icmp_threshold_mbps?: number;
  syn_flood_threshold?: number;
  syn_flood_block_secs?: number;
  /** 0 or 1 */
  always_on_mitigation?: number;
  /** 0 or 1 */
  symmetric_routing?: number;
}

export interface DDoSProtectionProfile extends Required<DDoSProtectionProfileSettings> {
  network: string;
}

export interface DDoSCountry {
  iso_code: string;
  name?: string | null;
}

export interface DDoSASN {
  asn: number;
  name?: string | null;
}

export interface DDoSPrefixList {
  uuid: string;
  name: string;
  description?: string | null;
  /** Lists provided by CubePath, read only. */
  is_global?: boolean;
  created_at?: string | null;
  entries_count?: number;
}

export interface CreateDDoSPrefixListRequest {
  name: string;
  description?: string;
}

/**
 * action: 0 DROP, 1 ACCEPT, 2 FILTER, 10-12 FiveM TCP, 15-17 FiveM UDP, 20-21 RDP,
 * 30-31 DNS, 40 Minecraft Java, 50 TLS, 60 rate limit (pps), 61 rate limit (Mbps).
 * protocol: 0 any, 1 ICMP, 6 TCP, 17 UDP. dst_port 0 means any port.
 */
export interface CreateDDoSFirewallRuleRequest {
  network: string;
  protocol: number;
  dst_port: number;
  action: number;
  /** Rate limit values, only for actions 60 and 61. */
  tcp_syn?: number;
  tcp_ack?: number;
  tcp_synack?: number;
  tcp_rst?: number;
  tcp_fin?: number;
  tcp_all?: number;
  udp?: number;
  icmp?: number;
}

export interface DDoSFirewallRule extends Required<CreateDDoSFirewallRuleRequest> {
  id: number;
  action_label: string;
}

export interface DeleteDDoSFirewallRulesParams {
  network: string;
  protocol: number;
  dst_port: number;
}

export interface DDoSTrafficCaptureIP {
  address: string;
  netmask?: string | null;
  network: string;
  location?: string | null;
  assigned_to?: string | null;
}

export interface DDoSTrafficStatsRequest {
  /** ISO 8601. */
  start_time: string;
  end_time: string;
  /** Your IPs to include; empty for all. */
  destination_ips?: string[];
  /** 10s, 30s, 1m (default), 5m, 15m or 1h */
  interval?: string;
}

export interface DDoSTrafficStats {
  start_time: string;
  end_time: string;
  interval: string;
  total_pass: number;
  total_drop: number;
  buckets: Array<{
    timestamp: string;
    pass_count: number;
    drop_count: number;
    pass_bytes: number;
    drop_bytes: number;
    pass_pps: number;
    drop_pps: number;
  }>;
}

export interface DDoSTrafficCaptureRequest {
  start_time: string;
  end_time: string;
  /** One of your protected IPs or subnets. */
  destination_ip: string;
  include_src_ips?: string[];
  exclude_src_ips?: string[];
  include_src_ports?: number[];
  exclude_src_ports?: number[];
  include_dst_ports?: number[];
  exclude_dst_ports?: number[];
  min_src_port?: number;
  max_src_port?: number;
  min_dst_port?: number;
  max_dst_port?: number;
  /** TCP, UDP, ICMP or OTHER */
  include_protocols?: string[];
  exclude_protocols?: string[];
  /** PASS or DROP */
  include_actions?: string[];
  exclude_actions?: string[];
  include_tcp_flags?: string[];
  exclude_tcp_flags?: string[];
  min_packet_len?: number;
  max_packet_len?: number;
  min_ttl?: number;
  max_ttl?: number;
  has_payload?: boolean;
  /** 1-100000, default 20000. */
  limit?: number;
}

export interface DDoSTrafficLog {
  timestamp: string;
  node?: string | null;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  action: string;
  mitigation_name?: string | null;
  is_drop: boolean;
  packet_len: number;
  ttl: number;
  sample_rate?: number | null;
  tcp_flags?: string | null;
  icmp_type?: number | null;
  icmp_code?: number | null;
  src_country?: string | null;
  payload_len?: number | null;
  payload?: string | null;
}

export interface DDoSTrafficCapture {
  start_time: string;
  end_time: string;
  total_logs: number;
  logs: DDoSTrafficLog[];
}

// ── Cloud Alerts ────────────────────────────────────────────────────────────

export type CloudAlertTargetType = 'vps' | 'baremetal' | 'availability_group';
/** Baremetal targets only support network_in and network_out. */
export type CloudAlertMetric = 'cpu' | 'ram' | 'disk' | 'network_in' | 'network_out';
export type CloudAlertOperator = 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
export type CloudAlertStatus = 'enabled' | 'disabled' | 'triggered' | 'resolved';

export interface CloudAlertActionRequest {
  /** Alerts can only send notifications. */
  action_type: 'notify';
  notificator_id: string;
  order?: number;
  enabled?: boolean;
}

export interface CloudAlertAction {
  id: string;
  action_type: string;
  notificator_id: string | null;
  config: Record<string, unknown> | null;
  order: number;
  enabled: boolean;
  created_at: string;
}

export interface CloudAlertSummary {
  id: string;
  project_id: number;
  name: string;
  description: string | null;
  target_type: CloudAlertTargetType;
  /** VPS or baremetal id, or availability group uuid. */
  target_id: string;
  metric_type: CloudAlertMetric;
  operator: CloudAlertOperator;
  threshold: number;
  status: CloudAlertStatus;
  actions_count?: number;
  created_at: string;
}

export interface CloudAlert extends Omit<CloudAlertSummary, 'actions_count'> {
  duration_seconds: number;
  cooldown_seconds: number;
  last_triggered_at: string | null;
  last_resolved_at: string | null;
  updated_at: string;
  actions: CloudAlertAction[];
}

export interface ListCloudAlertsParams {
  project_id?: number;
  status?: CloudAlertStatus;
}

export interface CreateCloudAlertRequest {
  project_id: number;
  name: string;
  description?: string;
  target_type: CloudAlertTargetType;
  target_id: string;
  metric_type: CloudAlertMetric;
  operator: CloudAlertOperator;
  /** 0 to 1000000. */
  threshold: number;
  /** How long the condition must hold, 60-3600 s (default 300). */
  duration_seconds?: number;
  /** Minimum time between two notifications, 60-86400 s (default 600). */
  cooldown_seconds?: number;
  /** 1 to 10 actions. */
  actions: CloudAlertActionRequest[];
}

/** Every field is optional; `actions` replaces all the actions. */
export interface UpdateCloudAlertRequest extends Partial<Omit<CreateCloudAlertRequest, 'project_id'>> {
  /** Use enabled / disabled to pause or resume the alert. */
  status?: CloudAlertStatus;
}

export interface CloudAlertHistoryEvent {
  id: string;
  trigger_id: string;
  event_type: string;
  metric_value: number | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type NotificatorType = 'slack' | 'email' | 'discord';

export interface Notificator {
  id: string;
  name: string;
  type: NotificatorType;
  /** Slack and Discord: { webhook_url } (masked when read back); email: { email }. */
  config: Record<string, string>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificatorRequest {
  name: string;
  type: NotificatorType;
  /** { webhook_url } for slack and discord; omit for email (sent to your address). */
  config?: { webhook_url: string };
  enabled?: boolean;
}

export interface UpdateNotificatorRequest {
  name?: string;
  config?: { webhook_url: string };
  enabled?: boolean;
}

// ── Transcoder ──────────────────────────────────────────────────────────────

/** Any S3 compatible bucket. `path` is the object key (input) or the destination prefix (output). */
export interface TranscoderS3Location {
  /** Omit for AWS. */
  endpoint?: string;
  region?: string;
  bucket: string;
  path?: string;
  access_key?: string;
  /** Never returned by the API. */
  secret_key?: string;
}

export interface TranscoderJobInput {
  source: 'url' | 's3';
  url?: string;
  s3?: TranscoderS3Location;
}

/** `type` plus free-form per-format settings (codec, height, container, ladder...). */
export interface TranscoderOutputSpec {
  type: 'file' | 'hls' | 'thumbnails' | 'gif';
  [setting: string]: unknown;
}

export interface CreateTranscoderJobRequest {
  input: TranscoderJobInput;
  output: { s3: TranscoderS3Location };
  /** 1 to 20 outputs. */
  outputs: TranscoderOutputSpec[];
  /** Called when the job finishes or fails. */
  webhook_url?: string;
  /** Sending the same key again returns the original job. */
  idempotency_key?: string;
}

export interface CreateTranscoderBatchRequest {
  output: { s3: TranscoderS3Location };
  outputs: TranscoderOutputSpec[];
  /** Its s3 block is inherited by the inputs that only give a `path`. */
  input_defaults?: TranscoderJobInput;
  /** 1 to 1000 inputs: each an s3 location, a url, or a path under input_defaults.s3. */
  inputs: Array<{
    s3?: TranscoderS3Location;
    url?: string;
    path?: string;
    /** Appended verbatim to the output path. */
    out_subpath?: string;
  }>;
  webhook_url?: string;
}

export interface TranscoderBatch {
  batch_id: string;
  job_ids: string[];
  count: number;
}

export interface TranscoderJob {
  uuid: string;
  /** queued, analyzing, encoding, finalizing, completed, failed or canceled */
  status: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  spec: { outputs: TranscoderOutputSpec[] } | null;
  /** Files produced ([{ type, bucket, key }]); null until the job finishes. */
  outputs: Array<{ type: string; bucket: string; key: string }> | null;
  progress: number | null;
  total_segments: number | null;
  completed_segments: number | null;
  batch_id: string | null;
  error: string | null;
  created_at: string | null;
}

export interface ListTranscoderJobsParams {
  batch_id?: string;
  /** 1-500, default 100. */
  limit?: number;
  offset?: number;
}

/** No total count: keep paging until a page has fewer than `limit` jobs. */
export interface TranscoderJobList {
  jobs: TranscoderJob[];
  limit: number;
  offset: number;
}

export interface TranscoderJobOutputs {
  outputs: Array<{ type: string; bucket: string; key: string }> | null;
  destination: Record<string, unknown> | null;
}
