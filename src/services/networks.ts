import { HttpClient } from '../client';
import { Network, CreateNetworkRequest, UpdateNetworkRequest, ProjectResponse } from '../types';

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
}
