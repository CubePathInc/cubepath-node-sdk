import { HttpClient } from '../client';
import {
  Baremetal,
  CreateBaremetalRequest,
  UpdateBaremetalRequest,
  ReinstallBaremetalRequest,
  TaskResponse,
  RescueResponse,
  BMCSensors,
  IPMISession,
  ReinstallStatus,
  BaremetalPowerAction,
  ProjectResponse,
} from '../types';

export class BaremetalService {
  constructor(private readonly http: HttpClient) {}

  async deploy(projectId: string, req: CreateBaremetalRequest): Promise<TaskResponse> {
    return this.http.post<TaskResponse>(`/baremetal/deploy/${projectId}`, req);
  }

  async list(): Promise<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/projects/');
  }

  async get(baremetalId: string): Promise<Baremetal> {
    const projects = await this.list();
    for (const project of projects) {
      const bm = project.baremetals?.find((b) => b.id === baremetalId);
      if (bm) return bm;
    }
    throw new Error(`Baremetal ${baremetalId} not found`);
  }

  async update(baremetalId: string, req: UpdateBaremetalRequest): Promise<void> {
    await this.http.patch(`/baremetal/update/${baremetalId}`, req);
  }

  async power(baremetalId: string, action: BaremetalPowerAction): Promise<void> {
    await this.http.post(`/baremetal/${baremetalId}/power/${action}`);
  }

  async rescue(baremetalId: string): Promise<RescueResponse> {
    return this.http.post<RescueResponse>(`/baremetal/${baremetalId}/rescue`);
  }

  async resetBMC(baremetalId: string): Promise<void> {
    await this.http.post(`/baremetal/${baremetalId}/reset-bmc`);
  }

  async bmcSensors(baremetalId: string): Promise<BMCSensors> {
    return this.http.get<BMCSensors>(`/baremetal/${baremetalId}/bmc-sensors`);
  }

  async ipmiSession(baremetalId: string): Promise<IPMISession> {
    return this.http.post<IPMISession>(`/ipmi-proxy/create-session/${baremetalId}`);
  }

  async reinstall(baremetalId: string, req: ReinstallBaremetalRequest): Promise<void> {
    await this.http.post(`/baremetal/${baremetalId}/reinstall`, req);
  }

  async reinstallStatus(baremetalId: string): Promise<ReinstallStatus> {
    return this.http.get<ReinstallStatus>(`/baremetal/${baremetalId}/reinstall/status`);
  }

  async enableMonitoring(baremetalId: string): Promise<void> {
    await this.http.put(`/baremetal/${baremetalId}/monitoring`, undefined, { enable: 'true' });
  }

  async disableMonitoring(baremetalId: string): Promise<void> {
    await this.http.put(`/baremetal/${baremetalId}/monitoring`, undefined, { enable: 'false' });
  }
}
