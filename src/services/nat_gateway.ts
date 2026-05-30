import { HttpClient } from '../client';
import {
  NATGateway,
  NATGatewayLocationPlans,
  CreateNATGatewayRequest,
  UpdateNATGatewayRequest,
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

  async getMetrics(uuid: string): Promise<unknown> {
    return this.http.get<unknown>(`/nat-gateway/${uuid}/metrics`);
  }

  async getBandwidthUsage(uuid: string): Promise<unknown> {
    return this.http.get<unknown>(`/nat-gateway/${uuid}/bandwidth-usage`);
  }
}
