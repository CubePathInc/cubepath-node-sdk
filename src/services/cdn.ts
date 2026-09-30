import { HttpClient } from '../client';
import {
  CDNZone,
  CDNOrigin,
  CDNRule,
  CDNPlan,
  CDNMetricsParams,
  CDNMetricType,
  CreateCDNZoneRequest,
  UpdateCDNZoneRequest,
  CDNZoneUpdateResponse,
  CreateCDNOriginRequest,
  UpdateCDNOriginRequest,
  CreateCDNRuleRequest,
  UpdateCDNRuleRequest,
  CDNPurgeRequest,
  CDNPurgeResponse,
  CDNPurge,
  CDNTokenSecretResponse,
  CDNSignURLRequest,
  CDNSignedURL,
} from '../types';

export class CDNWAFService {
  constructor(private readonly http: HttpClient) {}

  async list(zoneUUID: string): Promise<CDNRule[]> {
    return this.http.get<CDNRule[]>(`/cdn/zones/${zoneUUID}/waf-rules`);
  }

  async get(zoneUUID: string, ruleUUID: string): Promise<CDNRule> {
    return this.http.get<CDNRule>(`/cdn/zones/${zoneUUID}/waf-rules/${ruleUUID}`);
  }

  async create(zoneUUID: string, req: CreateCDNRuleRequest): Promise<CDNRule> {
    return this.http.post<CDNRule>(`/cdn/zones/${zoneUUID}/waf-rules`, req);
  }

  async update(zoneUUID: string, ruleUUID: string, req: UpdateCDNRuleRequest): Promise<CDNRule> {
    return this.http.patch<CDNRule>(`/cdn/zones/${zoneUUID}/waf-rules/${ruleUUID}`, req);
  }

  async delete(zoneUUID: string, ruleUUID: string): Promise<void> {
    await this.http.delete(`/cdn/zones/${zoneUUID}/waf-rules/${ruleUUID}`);
  }
}

export class CDNService {
  public readonly waf: CDNWAFService;

  constructor(private readonly http: HttpClient) {
    this.waf = new CDNWAFService(http);
  }

  // Zone operations

  async listZones(): Promise<CDNZone[]> {
    return this.http.get<CDNZone[]>('/cdn/zones');
  }

  async getZone(zoneUUID: string): Promise<CDNZone> {
    return this.http.get<CDNZone>(`/cdn/zones/${zoneUUID}`);
  }

  async createZone(req: CreateCDNZoneRequest): Promise<CDNZone> {
    return this.http.post<CDNZone>('/cdn/zones', req);
  }

  async updateZone(zoneUUID: string, req: UpdateCDNZoneRequest): Promise<CDNZoneUpdateResponse> {
    return this.http.patch<CDNZoneUpdateResponse>(`/cdn/zones/${zoneUUID}`, req);
  }

  async deleteZone(zoneUUID: string): Promise<void> {
    await this.http.delete(`/cdn/zones/${zoneUUID}`);
  }

  async getZonePricing(zoneUUID: string): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`/cdn/zones/${zoneUUID}/pricing`);
  }

  async listPlans(): Promise<CDNPlan[]> {
    return this.http.get<CDNPlan[]>('/cdn/plans');
  }

  // Origin operations

  async listOrigins(zoneUUID: string): Promise<CDNOrigin[]> {
    return this.http.get<CDNOrigin[]>(`/cdn/zones/${zoneUUID}/origins`);
  }

  async createOrigin(zoneUUID: string, req: CreateCDNOriginRequest): Promise<CDNOrigin> {
    return this.http.post<CDNOrigin>(`/cdn/zones/${zoneUUID}/origins`, req);
  }

  async updateOrigin(zoneUUID: string, originUUID: string, req: UpdateCDNOriginRequest): Promise<CDNOrigin> {
    return this.http.patch<CDNOrigin>(`/cdn/zones/${zoneUUID}/origins/${originUUID}`, req);
  }

  async deleteOrigin(zoneUUID: string, originUUID: string): Promise<void> {
    await this.http.delete(`/cdn/zones/${zoneUUID}/origins/${originUUID}`);
  }

  // Edge rule operations

  async listRules(zoneUUID: string): Promise<CDNRule[]> {
    return this.http.get<CDNRule[]>(`/cdn/zones/${zoneUUID}/rules`);
  }

  async getRule(zoneUUID: string, ruleUUID: string): Promise<CDNRule> {
    return this.http.get<CDNRule>(`/cdn/zones/${zoneUUID}/rules/${ruleUUID}`);
  }

  async createRule(zoneUUID: string, req: CreateCDNRuleRequest): Promise<CDNRule> {
    return this.http.post<CDNRule>(`/cdn/zones/${zoneUUID}/rules`, req);
  }

  async updateRule(zoneUUID: string, ruleUUID: string, req: UpdateCDNRuleRequest): Promise<CDNRule> {
    return this.http.patch<CDNRule>(`/cdn/zones/${zoneUUID}/rules/${ruleUUID}`, req);
  }

  async deleteRule(zoneUUID: string, ruleUUID: string): Promise<void> {
    await this.http.delete(`/cdn/zones/${zoneUUID}/rules/${ruleUUID}`);
  }

  // Metrics

  async getMetrics(
    zoneUUID: string,
    metricType: CDNMetricType,
    params?: CDNMetricsParams,
  ): Promise<Record<string, unknown>> {
    const query: Record<string, string> = {};
    if (params?.minutes) query.minutes = String(params.minutes);
    if (params?.interval_seconds) query.interval_seconds = String(params.interval_seconds);
    if (params?.group_by) query.group_by = params.group_by;
    if (params?.limit) query.limit = String(params.limit);
    for (const key of ['country', 'asn', 'status', 'status_range', 'cache_status', 'device_type', 'path_prefix'] as const) {
      if (params?.[key]) query[key] = params[key] as string;
    }
    return this.http.get<Record<string, unknown>>(`/cdn/zones/${zoneUUID}/metrics/${metricType}`, query);
  }

  // Actions

  /**
   * Re-trigger automatic SSL issuance for the zone's current custom_domain.
   * Use after fixing a missing/incorrect CNAME — the PATCH zone flow only
   * queues a cert task when custom_domain changes, so this is the way to
   * retry without resetting the field.
   */
  async requestSsl(zoneUUID: string): Promise<{ detail: string }> {
    return this.http.post<{ detail: string }>(`/cdn/zones/${zoneUUID}/request-ssl`, {});
  }

  /**
   * Purge cached content on every edge node: `{ everything: true }` or up to 100 `paths`
   * (a trailing `*` purges a prefix). Runs asynchronously; follow it with listPurges.
   */
  async purgeCache(zoneUUID: string, req: CDNPurgeRequest): Promise<CDNPurgeResponse> {
    return this.http.post<CDNPurgeResponse>(`/cdn/zones/${zoneUUID}/purge-cache`, req);
  }

  /** Recent purges of the zone with their progress per node and PoP. */
  async listPurges(zoneUUID: string): Promise<CDNPurge[]> {
    return this.http.get<CDNPurge[]>(`/cdn/zones/${zoneUUID}/purge-cache`);
  }

  /**
   * Generate a new token auth secret (shown only once). URLs signed with the old one stop
   * working. Enable token auth first with updateZone({ token_auth_enabled: true }).
   */
  async rotateTokenSecret(zoneUUID: string): Promise<CDNTokenSecretResponse> {
    return this.http.post<CDNTokenSecretResponse>(`/cdn/zones/${zoneUUID}/token-auth/rotate-secret`, {});
  }

  /** Sign a URL for a zone with token auth enabled. */
  async signURL(zoneUUID: string, req: CDNSignURLRequest): Promise<CDNSignedURL> {
    return this.http.post<CDNSignedURL>(`/cdn/zones/${zoneUUID}/token-auth/sign-url`, req);
  }

  /**
   * Reassign a CDN zone to a different project in the same organization.
   */
  async moveZoneToProject(zoneUUID: string, projectId: number): Promise<{ detail: string }> {
    return this.http.post<{ detail: string }>(`/cdn/zones/${zoneUUID}/move-project`, {
      project_id: projectId,
    });
  }
}
