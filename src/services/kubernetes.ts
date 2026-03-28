import { HttpClient } from '../client';
import {
  KubernetesVersion,
  KubernetesPlan,
  KubernetesCluster,
  KubernetesClusterResponse,
  NodePool,
  NodePoolResponse,
  KubernetesAddon,
  InstalledAddon,
  KubernetesLB,
  CreateKubernetesClusterRequest,
  UpdateKubernetesClusterRequest,
  CreateNodePoolRequest,
  UpdateNodePoolRequest,
  InstallAddonRequest,
} from '../types';

export class KubernetesNodePoolsService {
  constructor(private readonly http: HttpClient) {}

  async list(clusterUUID: string): Promise<NodePool[]> {
    return this.http.get<NodePool[]>(`/kubernetes/${clusterUUID}/node-pools/`);
  }

  async create(clusterUUID: string, req: CreateNodePoolRequest): Promise<NodePoolResponse> {
    return this.http.post<NodePoolResponse>(`/kubernetes/${clusterUUID}/node-pools/`, req);
  }

  async update(clusterUUID: string, poolUUID: string, req: UpdateNodePoolRequest): Promise<void> {
    await this.http.patch(`/kubernetes/${clusterUUID}/node-pools/${poolUUID}`, req);
  }

  async delete(clusterUUID: string, poolUUID: string): Promise<void> {
    await this.http.delete(`/kubernetes/${clusterUUID}/node-pools/${poolUUID}`);
  }

  async addNodes(clusterUUID: string, poolUUID: string, count: number): Promise<void> {
    await this.http.post(`/kubernetes/${clusterUUID}/node-pools/${poolUUID}/nodes`, { count });
  }

  async removeNode(clusterUUID: string, poolUUID: string, vpsId: string): Promise<void> {
    await this.http.delete(`/kubernetes/${clusterUUID}/node-pools/${poolUUID}/nodes/${vpsId}`);
  }
}

export class KubernetesAddonsService {
  constructor(private readonly http: HttpClient) {}

  async listAvailable(): Promise<KubernetesAddon[]> {
    return this.http.get<KubernetesAddon[]>('/kubernetes/addons');
  }

  async get(slug: string): Promise<KubernetesAddon> {
    return this.http.get<KubernetesAddon>(`/kubernetes/addons/${slug}`);
  }

  async listInstalled(clusterUUID: string): Promise<InstalledAddon[]> {
    return this.http.get<InstalledAddon[]>(`/kubernetes/${clusterUUID}/addons`);
  }

  async install(clusterUUID: string, slug: string, req?: InstallAddonRequest): Promise<void> {
    await this.http.post(`/kubernetes/${clusterUUID}/addons/${slug}/install`, req);
  }

  async uninstall(clusterUUID: string, addonUUID: string): Promise<void> {
    await this.http.delete(`/kubernetes/${clusterUUID}/addons/${addonUUID}`);
  }
}

export class KubernetesService {
  public readonly nodePools: KubernetesNodePoolsService;
  public readonly addons: KubernetesAddonsService;

  constructor(private readonly http: HttpClient) {
    this.nodePools = new KubernetesNodePoolsService(http);
    this.addons = new KubernetesAddonsService(http);
  }

  async listVersions(): Promise<KubernetesVersion[]> {
    return this.http.get<KubernetesVersion[]>('/kubernetes/versions');
  }

  async listPlans(version?: string): Promise<KubernetesPlan[]> {
    const query = version ? { version } : undefined;
    return this.http.get<KubernetesPlan[]>('/kubernetes/plans', query);
  }

  async list(): Promise<KubernetesCluster[]> {
    return this.http.get<KubernetesCluster[]>('/kubernetes/');
  }

  async get(clusterUUID: string): Promise<KubernetesCluster> {
    return this.http.get<KubernetesCluster>(`/kubernetes/${clusterUUID}`);
  }

  async create(req: CreateKubernetesClusterRequest): Promise<KubernetesClusterResponse> {
    return this.http.post<KubernetesClusterResponse>('/kubernetes/', req);
  }

  async update(clusterUUID: string, req: UpdateKubernetesClusterRequest): Promise<void> {
    await this.http.patch(`/kubernetes/${clusterUUID}`, req);
  }

  async delete(clusterUUID: string): Promise<void> {
    await this.http.delete(`/kubernetes/${clusterUUID}`);
  }

  async getKubeconfig(clusterUUID: string): Promise<string> {
    return this.http.get<string>(`/kubernetes/${clusterUUID}/kubeconfig`);
  }

  async move(clusterUUID: string, projectId: string): Promise<void> {
    await this.http.post(`/kubernetes/${clusterUUID}/move`, { project_id: projectId });
  }

  async listLoadBalancers(clusterUUID: string): Promise<KubernetesLB[]> {
    return this.http.get<KubernetesLB[]>(`/kubernetes/${clusterUUID}/loadbalancers`);
  }
}
