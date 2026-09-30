import { HttpClient } from '../client';
import {
  Network,
  CreateNetworkRequest,
  UpdateNetworkRequest,
  ProjectResponse,
  NetworkRoute,
  CreateNetworkRouteRequest,
  DetailResponse,
  BGPPeer,
  CreateBGPPeerRequest,
  CreateBGPPeerResponse,
  UpdateBGPPeerRequest,
} from '../types';

export class NetworksService {
  constructor(private readonly http: HttpClient) {}

  async create(req: CreateNetworkRequest): Promise<Network> {
    return this.http.post<Network>('/networks/create_network', req);
  }

  async list(): Promise<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/projects/');
  }

  async update(networkId: string, req: UpdateNetworkRequest): Promise<void> {
    await this.http.put(`/networks/${networkId}`, req);
  }

  async delete(networkId: string): Promise<void> {
    await this.http.delete(`/networks/${networkId}`);
  }

  async listRoutes(networkId: number): Promise<NetworkRoute[]> {
    return this.http.get<NetworkRoute[]>(`/networks/${networkId}/routes`);
  }

  async createRoute(networkId: number, req: CreateNetworkRouteRequest): Promise<NetworkRoute> {
    return this.http.post<NetworkRoute>(`/networks/${networkId}/routes`, req);
  }

  async deleteRoute(networkId: number, routeId: string): Promise<void> {
    await this.http.delete(`/networks/${networkId}/routes/${routeId}`);
  }

  async moveToProject(networkId: number | string, projectId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/networks/${networkId}/move-project`, { project_id: projectId });
  }

  // BGP peers: sessions between the network's routers and your servers or IPs

  async listBGPPeers(networkId: number | string): Promise<BGPPeer[]> {
    return this.http.get<BGPPeer[]>(`/networks/${networkId}/bgp-peers`);
  }

  async createBGPPeer(networkId: number | string, req: CreateBGPPeerRequest): Promise<CreateBGPPeerResponse> {
    return this.http.post<CreateBGPPeerResponse>(`/networks/${networkId}/bgp-peers`, req);
  }

  async updateBGPPeer(networkId: number | string, peerId: string, req: UpdateBGPPeerRequest): Promise<DetailResponse> {
    return this.http.patch<DetailResponse>(`/networks/${networkId}/bgp-peers/${peerId}`, req);
  }

  async deleteBGPPeer(networkId: number | string, peerId: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/networks/${networkId}/bgp-peers/${peerId}`);
  }
}
