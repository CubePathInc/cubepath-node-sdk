import { HttpClient } from '../client';
import {
  FirewallGroup,
  CreateFirewallGroupRequest,
  UpdateFirewallGroupRequest,
  VPSFirewallGroupsRequest,
  VPSFirewallGroupsResponse,
} from '../types';

export class FirewallService {
  constructor(private readonly http: HttpClient) {}

  async create(req: CreateFirewallGroupRequest): Promise<FirewallGroup> {
    return this.http.post<FirewallGroup>('/firewall/groups', req);
  }

  async list(): Promise<FirewallGroup[]> {
    return this.http.get<FirewallGroup[]>('/firewall/groups');
  }

  async get(groupId: string): Promise<FirewallGroup> {
    return this.http.get<FirewallGroup>(`/firewall/groups/${groupId}`);
  }

  async update(groupId: string, req: UpdateFirewallGroupRequest): Promise<FirewallGroup> {
    return this.http.patch<FirewallGroup>(`/firewall/groups/${groupId}`, req);
  }

  async delete(groupId: string): Promise<void> {
    await this.http.delete(`/firewall/groups/${groupId}`);
  }

  async assignToVPS(vpsId: string, req: VPSFirewallGroupsRequest): Promise<VPSFirewallGroupsResponse> {
    return this.http.post<VPSFirewallGroupsResponse>(`/vps/${vpsId}/firewall-groups`, req);
  }
}
