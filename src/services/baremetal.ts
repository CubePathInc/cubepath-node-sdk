import { HttpClient } from '../client';
import { CubePathError } from '../errors';
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
  DetailResponse,
  BaremetalKVM,
  BaremetalOSOption,
  BaremetalModelsResponse,
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

  /** Temperatures and fan speeds from the last BMC poll, served through GraphQL. */
  async bmcSensors(baremetalId: string): Promise<BMCSensors> {
    type Reading = { name: string; value: number; unit: string };
    const data = await this.http.graphql<{
      baremetal: {
        sensors: {
          ipmiAvailable: boolean | null;
          powerOn: boolean | null;
          lastSeen: number | null;
          temperatures: Reading[];
          fans: Reading[];
        };
      } | null;
    }>(
      'query($id: ID!) { baremetal(id: $id) { sensors { ipmiAvailable powerOn lastSeen temperatures { name value unit } fans { name value unit } } } }',
      { id: String(baremetalId) },
    );
    if (!data?.baremetal) throw new CubePathError(404, 'Not Found', `Baremetal ${baremetalId} not found`);
    const s = data.baremetal.sensors;
    return {
      node: '',
      ipmi_available: s.ipmiAvailable ?? false,
      power_on: s.powerOn ?? false,
      last_seen: s.lastSeen ?? null,
      sensors: { temperatures: s.temperatures ?? [], fans: s.fans ?? [] },
    };
  }

  async ipmiSession(baremetalId: string): Promise<IPMISession> {
    return this.http.post<IPMISession>(`/ipmi-proxy/create-session/${baremetalId}`);
  }

  async reinstall(baremetalId: string, req: ReinstallBaremetalRequest): Promise<void> {
    await this.http.post(`/baremetal/${baremetalId}/reinstall`, req);
  }

  /**
   * Whether an OS reinstallation is running. There is no dedicated endpoint any more: a
   * server is reinstalling while its status is `deploying`.
   */
  async reinstallStatus(baremetalId: string): Promise<ReinstallStatus> {
    const bm = await this.get(baremetalId);
    return { is_reinstalling: bm.status === 'deploying', status: bm.status, os_name: '' };
  }

  /** Cancel a pending or running OS reinstallation. */
  async cancelReinstall(baremetalId: string): Promise<void> {
    await this.http.delete(`/baremetal/${baremetalId}/reinstall`);
  }

  async enableMonitoring(baremetalId: string): Promise<void> {
    await this.http.put(`/baremetal/${baremetalId}/monitoring`, undefined, { enable: 'true' });
  }

  async disableMonitoring(baremetalId: string): Promise<void> {
    await this.http.put(`/baremetal/${baremetalId}/monitoring`, undefined, { enable: 'false' });
  }

  /** Models available by location, with price and stock. */
  async listModels(): Promise<BaremetalModelsResponse> {
    return this.http.get<BaremetalModelsResponse>('/baremetal/models');
  }

  /** Operating systems and disk layouts the server can be reinstalled with. */
  async listOS(baremetalId: string): Promise<BaremetalOSOption[]> {
    return this.http.get<BaremetalOSOption[]>(`/baremetal/os/${baremetalId}`);
  }

  /** Credentials of the server's KVM console, when it has one. */
  async kvm(baremetalId: string): Promise<BaremetalKVM> {
    return this.http.get<BaremetalKVM>(`/baremetal/${baremetalId}/kvm`);
  }

  async setProtection(baremetalId: string, enabled: boolean): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalId}/protection`, { enabled });
  }

  async moveToProject(baremetalId: string, projectId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalId}/move-project`, { project_id: projectId });
  }

  /** Associate SSH keys with the server. They are installed on the next reinstall. */
  async addSSHKeys(baremetalId: string, sshKeyIds: number[]): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalId}/ssh-keys`, sshKeyIds);
  }

  async removeSSHKey(baremetalId: string, sshKeyId: number | string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/baremetal/${baremetalId}/ssh-keys/${sshKeyId}`);
  }

  /** Attach the server to a private network of its location. */
  async attachNetwork(baremetalId: string, networkId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalId}/network`, { network_id: networkId });
  }

  async detachNetwork(baremetalId: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/baremetal/${baremetalId}/network`);
  }
}
