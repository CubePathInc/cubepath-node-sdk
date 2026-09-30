import { HttpClient } from '../client';
import {
  VPS,
  CreateVPSRequest,
  UpdateVPSRequest,
  TaskResponse,
  VPSPowerAction,
  ProjectResponse,
  VPSBackup,
  VPSBackupSettings,
  CreateVPSBackupRequest,
  UpdateVPSBackupSettingsRequest,
  ISOListResponse,
  VPSTemplatesResponse,
  VPSPlansResponse,
  VNCSession,
  DetailResponse,
  ListVPSBackupsParams,
  AvailabilityGroup,
  CreateAvailabilityGroupRequest,
  CreateAvailabilityGroupResponse,
  AvailabilityGroupMemberResponse,
} from '../types';

export class VPSBackupsService {
  constructor(private readonly http: HttpClient) {}

  async list(vpsId: string, params?: ListVPSBackupsParams): Promise<VPSBackup[]> {
    const query: Record<string, string> = {};
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.offset !== undefined) query.offset = String(params.offset);
    const res = await this.http.get<VPSBackup[] | { backups: VPSBackup[] }>(
      `/vps/${vpsId}/backups`,
      Object.keys(query).length ? query : undefined,
    );
    return Array.isArray(res) ? res : res.backups;
  }

  /** Starts a manual backup; poll list until its status is completed. */
  async create(vpsId: string, req?: CreateVPSBackupRequest): Promise<VPSBackup> {
    return this.http.post<VPSBackup>(`/vps/${vpsId}/backups`, req ?? {});
  }

  async restore(vpsId: string, backupId: string): Promise<void> {
    await this.http.post(`/vps/${vpsId}/backups/${backupId}/restore`, { confirm: true });
  }

  async delete(vpsId: string, backupId: string): Promise<void> {
    await this.http.delete(`/vps/${vpsId}/backups/${backupId}`);
  }

  async getSettings(vpsId: string): Promise<VPSBackupSettings> {
    return this.http.get<VPSBackupSettings>(`/vps/${vpsId}/backup/settings`);
  }

  async updateSettings(vpsId: string, req: UpdateVPSBackupSettingsRequest): Promise<void> {
    await this.http.put(`/vps/${vpsId}/backup/settings`, req);
  }
}

export class VPSISOsService {
  constructor(private readonly http: HttpClient) {}

  async list(vpsId: string): Promise<ISOListResponse> {
    return this.http.get<ISOListResponse>(`/vps/${vpsId}/isos`);
  }

  async mount(vpsId: string, isoId: string): Promise<void> {
    await this.http.post(`/vps/${vpsId}/iso`, { iso_id: isoId });
  }

  async unmount(vpsId: string): Promise<void> {
    await this.http.delete(`/vps/${vpsId}/iso`);
  }
}

/** Groups that place their VPS on different hosts. */
export class VPSAvailabilityGroupsService {
  constructor(private readonly http: HttpClient) {}

  async create(req: CreateAvailabilityGroupRequest): Promise<CreateAvailabilityGroupResponse> {
    return this.http.post<CreateAvailabilityGroupResponse>('/vps/availability-groups/', req);
  }

  async get(groupUUID: string): Promise<AvailabilityGroup> {
    return this.http.get<AvailabilityGroup>(`/vps/availability-groups/${groupUUID}`);
  }

  async list(projectId: string | number, locationName?: string): Promise<AvailabilityGroup[]> {
    const query = locationName ? { location_name: locationName } : undefined;
    const res = await this.http.get<{ groups: AvailabilityGroup[] }>(
      `/vps/availability-groups/project/${projectId}`,
      query,
    );
    return res.groups;
  }

  /** Only an empty group can be deleted. */
  async delete(groupUUID: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/vps/availability-groups/${groupUUID}`);
  }

  async moveToProject(groupUUID: string, projectId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/vps/availability-groups/${groupUUID}/move-project`, {
      project_id: projectId,
    });
  }

  async addVPS(groupUUID: string, vpsId: string | number): Promise<AvailabilityGroupMemberResponse> {
    return this.http.post<AvailabilityGroupMemberResponse>(`/vps/availability-groups/${groupUUID}/vps/${vpsId}`);
  }

  async removeVPS(groupUUID: string, vpsId: string | number): Promise<AvailabilityGroupMemberResponse> {
    return this.http.delete<AvailabilityGroupMemberResponse>(`/vps/availability-groups/${groupUUID}/vps/${vpsId}`);
  }
}

export class VPSService {
  public readonly backups: VPSBackupsService;
  public readonly isos: VPSISOsService;
  public readonly availabilityGroups: VPSAvailabilityGroupsService;

  constructor(private readonly http: HttpClient) {
    this.backups = new VPSBackupsService(http);
    this.isos = new VPSISOsService(http);
    this.availabilityGroups = new VPSAvailabilityGroupsService(http);
  }

  async create(projectId: string, req: CreateVPSRequest): Promise<TaskResponse> {
    return this.http.post<TaskResponse>(`/vps/create/${projectId}`, req);
  }

  async list(): Promise<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/projects/');
  }

  async get(vpsId: string): Promise<VPS> {
    const projects = await this.list();
    for (const project of projects) {
      const vps = project.vps?.find((v) => v.id === vpsId);
      if (vps) return vps;
    }
    throw new Error(`VPS ${vpsId} not found`);
  }

  async destroy(vpsId: string, releaseIPs = false): Promise<void> {
    await this.http.post(`/vps/destroy/${vpsId}`, { release_ips: releaseIPs });
  }

  async update(vpsId: string, req: UpdateVPSRequest): Promise<void> {
    await this.http.patch(`/vps/update/${vpsId}`, req);
  }

  async resize(vpsId: string, planName: string): Promise<void> {
    await this.http.post(`/vps/resize/vps_id/${vpsId}/resize_plan/${planName}`);
  }

  async changePassword(vpsId: string, password: string): Promise<void> {
    await this.http.post(`/vps/${vpsId}/change-password`, { password });
  }

  async reinstall(vpsId: string, templateName: string): Promise<void> {
    await this.http.post(`/vps/reinstall/${vpsId}`, { template_name: templateName });
  }

  async power(vpsId: string, action: VPSPowerAction): Promise<void> {
    await this.http.post(`/vps/${vpsId}/power/${action}`);
  }

  async templates(): Promise<VPSTemplatesResponse> {
    return this.http.get<VPSTemplatesResponse>('/vps/templates');
  }

  /** Plans by location and cluster, with their hourly price and stock status. */
  async plans(): Promise<VPSPlansResponse> {
    return this.http.get<VPSPlansResponse>('/vps/plans');
  }

  async setProtection(vpsId: string, enabled: boolean): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/vps/${vpsId}/protection`, { enabled });
  }

  async moveToProject(vpsId: string, projectId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/vps/${vpsId}/move-project`, { project_id: projectId });
  }

  /** A console session for noVNC, valid for 5 minutes. The VPS must be running. */
  async vncSession(vpsId: string): Promise<VNCSession> {
    return this.http.post<VNCSession>(`/vps/${vpsId}/vnc-url`);
  }

  /** Associate SSH keys with the VPS. They are installed on the next reinstall. */
  async addSSHKeys(vpsId: string, sshKeyIds: number[]): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/vps/${vpsId}/ssh-keys`, sshKeyIds);
  }

  async removeSSHKey(vpsId: string, sshKeyId: number | string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/vps/${vpsId}/ssh-keys/${sshKeyId}`);
  }

  /** Attach the VPS to a private network of its location. */
  async attachNetwork(vpsId: string, networkId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/vps/${vpsId}/network`, { network_id: networkId });
  }

  async detachNetwork(vpsId: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/vps/${vpsId}/network`);
  }
}
