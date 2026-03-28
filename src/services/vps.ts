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
} from '../types';

export class VPSBackupsService {
  constructor(private readonly http: HttpClient) {}

  async list(vpsId: string): Promise<VPSBackup[]> {
    return this.http.get<VPSBackup[]>(`/vps/${vpsId}/backups`);
  }

  async create(vpsId: string, req?: CreateVPSBackupRequest): Promise<void> {
    await this.http.post(`/vps/${vpsId}/backups`, req);
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

export class VPSService {
  public readonly backups: VPSBackupsService;
  public readonly isos: VPSISOsService;

  constructor(private readonly http: HttpClient) {
    this.backups = new VPSBackupsService(http);
    this.isos = new VPSISOsService(http);
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
}
