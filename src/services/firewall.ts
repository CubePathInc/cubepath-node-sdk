import { HttpClient } from '../client';
import { CubePathError } from '../errors';
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
    const { project_id, ...body } = req;
    if (!project_id) throw new Error('project_id is required to create a firewall group');
    return this.http.post<FirewallGroup>('/firewall/groups', body, { project_id: String(project_id) });
  }

  async list(): Promise<FirewallGroup[]> {
    return this.http.get<FirewallGroup[]>('/firewall/groups');
  }

  /** The API has no single-group endpoint, so the group is looked up in the list. */
  async get(groupId: string): Promise<FirewallGroup> {
    const group = (await this.list()).find((g) => String(g.id) === String(groupId));
    if (!group) throw new CubePathError(404, 'Not Found', `Firewall group ${groupId} not found`);
    return group;
  }

  /** Change the name, rules or enabled flag; omitted fields are left unchanged. */
  async update(groupId: string, req: UpdateFirewallGroupRequest): Promise<FirewallGroup> {
    return this.http.put<FirewallGroup>(`/firewall/groups/${groupId}`, req);
  }

  async delete(groupId: string): Promise<void> {
    await this.http.delete(`/firewall/groups/${groupId}`);
  }

  /**
   * Replace the firewall groups of a VPS (at most 10, in priority order). An empty list
   * removes them all. The new rules are applied in the background.
   */
  async assignToVPS(vpsId: string, req: VPSFirewallGroupsRequest): Promise<VPSFirewallGroupsResponse> {
    return this.http.put<VPSFirewallGroupsResponse>(`/firewall/vps/${vpsId}/groups`, req);
  }
}
