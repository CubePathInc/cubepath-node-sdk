import { HttpClient } from '../client';
import { CubePathError } from '../errors';
import {
  NATGateway,
  NATGatewayLocationPlans,
  CreateNATGatewayRequest,
  UpdateNATGatewayRequest,
  MetricsResult,
  MetricsTimeRange,
  BandwidthUsage,
} from '../types';

export class NATGatewayService {
  constructor(private readonly http: HttpClient) {}

  async listPlans(): Promise<NATGatewayLocationPlans[]> {
    return this.http.get<NATGatewayLocationPlans[]>('/nat-gateway/plans');
  }

  async list(): Promise<NATGateway[]> {
    return this.http.get<NATGateway[]>('/nat-gateway/');
  }

  async get(uuid: string): Promise<NATGateway> {
    return this.http.get<NATGateway>(`/nat-gateway/${uuid}`);
  }

  async create(req: CreateNATGatewayRequest): Promise<NATGateway> {
    return this.http.post<NATGateway>('/nat-gateway/', req);
  }

  async update(uuid: string, req: UpdateNATGatewayRequest): Promise<NATGateway> {
    return this.http.patch<NATGateway>(`/nat-gateway/${uuid}`, req);
  }

  async delete(uuid: string): Promise<void> {
    await this.http.delete(`/nat-gateway/${uuid}`);
  }

  async resize(uuid: string, planName: string): Promise<void> {
    await this.http.post(`/nat-gateway/${uuid}/resize`, { plan_name: planName });
  }

  async moveToProject(uuid: string, projectId: number): Promise<void> {
    await this.http.post(`/nat-gateway/${uuid}/move-to-project`, { project_id: projectId });
  }

  async setProtection(uuid: string, enabled: boolean): Promise<void> {
    await this.http.post(`/nat-gateway/${uuid}/protection`, { enabled });
  }

  /**
   * Traffic of the gateway (series bytes_in and bytes_out, bytes per second) over a window:
   * H1 (default), H3, H6, H12, H24, D3, D7 or D30. Served through GraphQL; returns
   * `{ start, end, step, series: [{ name, unit, points: [{ ts, value }] }] }`.
   */
  async getMetrics(uuid: string, range: MetricsTimeRange = 'H1'): Promise<MetricsResult> {
    const data = await this.http.graphql<{ natGateway: { metrics: MetricsResult } | null }>(
      'query($uuid: ID!, $range: TimeRange!) { natGateway(uuid: $uuid) { metrics(range: $range) { start end step series { name unit points { ts value } } } } }',
      { uuid, range },
    );
    if (!data?.natGateway) throw new CubePathError(404, 'Not Found', `NAT gateway ${uuid} not found`);
    return data.natGateway.metrics;
  }

  /** Month-to-date traffic of the gateway, served through GraphQL. */
  async getBandwidthUsage(uuid: string): Promise<BandwidthUsage> {
    const data = await this.http.graphql<{ natGateway: { bandwidthUsage: BandwidthUsage } | null }>(
      'query($uuid: ID!) { natGateway(uuid: $uuid) { bandwidthUsage { inBytes outBytes totalBytes periodStart periodEnd } } }',
      { uuid },
    );
    if (!data?.natGateway) throw new CubePathError(404, 'Not Found', `NAT gateway ${uuid} not found`);
    return data.natGateway.bandwidthUsage;
  }
}
