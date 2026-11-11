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
import { BaremetalRef, baremetalMatches, baremetalRef } from '../baremetal_ref';

export class BaremetalService {
  constructor(private readonly http: HttpClient) {}

  async deploy(projectId: string, req: CreateBaremetalRequest): Promise<TaskResponse> {
    return this.http.post<TaskResponse>(`/baremetal/deploy/${projectId}`, req);
  }

  async list(): Promise<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/projects/');
  }

  async get(baremetalId: BaremetalRef): Promise<Baremetal> {
    const ref = baremetalRef(baremetalId);
    const projects = await this.list();
    for (const project of projects) {
      const bm = project.baremetals?.find((b) => baremetalMatches(b, ref));
      if (bm) return bm;
    }
    throw new Error(`Baremetal ${ref} not found`);
  }

  async update(baremetalId: BaremetalRef, req: UpdateBaremetalRequest): Promise<void> {
    await this.http.patch(`/baremetal/update/${baremetalRef(baremetalId)}`, req);
  }

  async power(baremetalId: BaremetalRef, action: BaremetalPowerAction): Promise<void> {
    await this.http.post(`/baremetal/${baremetalRef(baremetalId)}/power/${action}`);
  }

  async rescue(baremetalId: BaremetalRef): Promise<RescueResponse> {
    return this.http.post<RescueResponse>(`/baremetal/${baremetalRef(baremetalId)}/rescue`);
  }

  async resetBMC(baremetalId: BaremetalRef): Promise<void> {
    await this.http.post(`/baremetal/${baremetalRef(baremetalId)}/reset-bmc`);
  }

  /** Temperatures and fan speeds from the last BMC poll, served through GraphQL. */
  async bmcSensors(baremetalId: BaremetalRef): Promise<BMCSensors> {
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
      { id: baremetalRef(baremetalId) },
    );
    if (!data?.baremetal) throw new CubePathError(404, 'Not Found', `Baremetal ${baremetalRef(baremetalId)} not found`);
    const s = data.baremetal.sensors;
    return {
      node: '',
      ipmi_available: s.ipmiAvailable ?? false,
      power_on: s.powerOn ?? false,
      last_seen: s.lastSeen ?? null,
      sensors: { temperatures: s.temperatures ?? [], fans: s.fans ?? [] },
    };
  }

  async ipmiSession(baremetalId: BaremetalRef): Promise<IPMISession> {
    return this.http.post<IPMISession>(`/ipmi-proxy/create-session/${baremetalRef(baremetalId)}`);
  }

  async reinstall(baremetalId: BaremetalRef, req: ReinstallBaremetalRequest): Promise<void> {
    await this.http.post(`/baremetal/${baremetalRef(baremetalId)}/reinstall`, req);
  }

  /**
   * Whether an OS reinstallation is running. There is no dedicated endpoint any more: a
   * server is reinstalling while its status is `deploying`.
   */
  async reinstallStatus(baremetalId: BaremetalRef): Promise<ReinstallStatus> {
    const bm = await this.get(baremetalId);
    return { is_reinstalling: bm.status === 'deploying', status: bm.status, os_name: '' };
  }

  /** Cancel a pending or running OS reinstallation. */
  async cancelReinstall(baremetalId: BaremetalRef): Promise<void> {
    await this.http.delete(`/baremetal/${baremetalRef(baremetalId)}/reinstall`);
  }

  async enableMonitoring(baremetalId: BaremetalRef): Promise<void> {
    await this.http.put(`/baremetal/${baremetalRef(baremetalId)}/monitoring`, undefined, { enable: 'true' });
  }

  async disableMonitoring(baremetalId: BaremetalRef): Promise<void> {
    await this.http.put(`/baremetal/${baremetalRef(baremetalId)}/monitoring`, undefined, { enable: 'false' });
  }

  /** Models available by location, with price and stock. */
  async listModels(): Promise<BaremetalModelsResponse> {
    return this.http.get<BaremetalModelsResponse>('/baremetal/models');
  }

  /** Operating systems and disk layouts the server can be reinstalled with. */
  async listOS(baremetalId: BaremetalRef): Promise<BaremetalOSOption[]> {
    return this.http.get<BaremetalOSOption[]>(`/baremetal/os/${baremetalRef(baremetalId)}`);
  }

  /** Credentials of the server's KVM console, when it has one. */
  async kvm(baremetalId: BaremetalRef): Promise<BaremetalKVM> {
    return this.http.get<BaremetalKVM>(`/baremetal/${baremetalRef(baremetalId)}/kvm`);
  }

  async setProtection(baremetalId: BaremetalRef, enabled: boolean): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalRef(baremetalId)}/protection`, { enabled });
  }

  async moveToProject(baremetalId: BaremetalRef, projectId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalRef(baremetalId)}/move-project`, { project_id: projectId });
  }

  /** Associate SSH keys with the server. They are installed on the next reinstall. */
  async addSSHKeys(baremetalId: BaremetalRef, sshKeyIds: number[]): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalRef(baremetalId)}/ssh-keys`, sshKeyIds);
  }

  async removeSSHKey(baremetalId: BaremetalRef, sshKeyId: number | string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/baremetal/${baremetalRef(baremetalId)}/ssh-keys/${sshKeyId}`);
  }

  /** Attach the server to a private network of its location. */
  async attachNetwork(baremetalId: BaremetalRef, networkId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/baremetal/${baremetalRef(baremetalId)}/network`, { network_id: networkId });
  }

  async detachNetwork(baremetalId: BaremetalRef): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/baremetal/${baremetalRef(baremetalId)}/network`);
  }
}
