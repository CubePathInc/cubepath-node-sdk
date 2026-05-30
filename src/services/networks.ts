import { HttpClient } from '../client';
import { Network, CreateNetworkRequest, UpdateNetworkRequest, ProjectResponse, NetworkRoute, CreateNetworkRouteRequest } from '../types';

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
}
