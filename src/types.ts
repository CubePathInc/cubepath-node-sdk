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
  ssh_key_names?: string[];
  user?: string;
  password?: string;
  ipv4?: boolean;
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

// ── VPS Backups ─────────────────────────────────────────────────────────────

export interface VPSBackup {
  id: string;
  backup_type: string;
  status: string;
  progress: number;
  size_gb: number;
  notes?: string;
  created_at: string;
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
  ssh_key_names?: string[];
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
  ssh_key_names?: string[];
}

export interface RescueResponse {
  detail: string;
  username: string;
  password: string;
}

export interface BMCSensors {
  node: string;
  ipmi_available: boolean;
  power_on: boolean;
  sensors: {
    temperatures: SensorReading[];
    fans: SensorReading[];
  };
}

export interface SensorReading {
  name: string;
  value: string;
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
  os_name: string;
}

export type BaremetalPowerAction = 'start_metal' | 'stop_metal' | 'restart_metal';

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
  direction: string;
  protocol: string;
  port?: string;
  source?: string;
  comment?: string;
}

export interface CreateFirewallGroupRequest {
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
  message: string;
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
}

export interface CreateCDNOriginRequest {
  name: string;
  origin_url?: string;
  address?: string;
  port?: number;
  protocol?: string;
  weight: number;
  priority: number;
  is_backup: boolean;
  health_check_enabled: boolean;
  health_check_path?: string;
  verify_ssl: boolean;
  host_header?: string;
  base_path?: string;
  enabled: boolean;
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
  attack_id: string;
  ip_address: string;
  start_time: string;
  duration: number;
  packets_second_peak: number;
  bytes_second_peak: number;
  status: string;
  description: string;
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
