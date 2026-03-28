import { HttpClient } from '../client';
import {
  LoadBalancer,
  LBListener,
  LBTarget,
  LBLocationPlans,
  HealthCheckConfig,
  CreateLoadBalancerRequest,
  UpdateLoadBalancerRequest,
  CreateListenerRequest,
  UpdateListenerRequest,
  AddTargetRequest,
  UpdateTargetRequest,
} from '../types';

export class LoadBalancerService {
  constructor(private readonly http: HttpClient) {}

  // Load balancer operations

  async list(): Promise<LoadBalancer[]> {
    return this.http.get<LoadBalancer[]>('/loadbalancer/');
  }

  async get(lbUUID: string): Promise<LoadBalancer> {
    return this.http.get<LoadBalancer>(`/loadbalancer/${lbUUID}`);
  }

  async create(req: CreateLoadBalancerRequest): Promise<LoadBalancer> {
    return this.http.post<LoadBalancer>('/loadbalancer/', req);
  }

  async update(lbUUID: string, req: UpdateLoadBalancerRequest): Promise<LoadBalancer> {
    return this.http.patch<LoadBalancer>(`/loadbalancer/${lbUUID}`, req);
  }

  async delete(lbUUID: string): Promise<void> {
    await this.http.delete(`/loadbalancer/${lbUUID}`);
  }

  async resize(lbUUID: string, planName: string): Promise<void> {
    await this.http.post(`/loadbalancer/${lbUUID}/resize`, { plan_name: planName });
  }

  async listPlans(): Promise<LBLocationPlans[]> {
    return this.http.get<LBLocationPlans[]>('/loadbalancer/plans');
  }

  // Listener operations

  async createListener(lbUUID: string, req: CreateListenerRequest): Promise<LBListener> {
    return this.http.post<LBListener>(`/loadbalancer/${lbUUID}/listeners`, req);
  }

  async updateListener(lbUUID: string, listenerUUID: string, req: UpdateListenerRequest): Promise<LBListener> {
    return this.http.patch<LBListener>(`/loadbalancer/${lbUUID}/listeners/${listenerUUID}`, req);
  }

  async deleteListener(lbUUID: string, listenerUUID: string): Promise<void> {
    await this.http.delete(`/loadbalancer/${lbUUID}/listeners/${listenerUUID}`);
  }

  // Target operations

  async addTarget(lbUUID: string, listenerUUID: string, req: AddTargetRequest): Promise<LBTarget> {
    return this.http.post<LBTarget>(`/loadbalancer/${lbUUID}/listeners/${listenerUUID}/targets`, req);
  }

  async updateTarget(
    lbUUID: string,
    listenerUUID: string,
    targetUUID: string,
    req: UpdateTargetRequest,
  ): Promise<LBTarget> {
    return this.http.patch<LBTarget>(
      `/loadbalancer/${lbUUID}/listeners/${listenerUUID}/targets/${targetUUID}`,
      req,
    );
  }

  async removeTarget(lbUUID: string, listenerUUID: string, targetUUID: string): Promise<void> {
    await this.http.delete(`/loadbalancer/${lbUUID}/listeners/${listenerUUID}/targets/${targetUUID}`);
  }

  async drainTarget(lbUUID: string, listenerUUID: string, targetUUID: string): Promise<void> {
    await this.http.post(`/loadbalancer/${lbUUID}/listeners/${listenerUUID}/targets/${targetUUID}/drain`);
  }

  // Health check operations

  async configureHealthCheck(lbUUID: string, listenerUUID: string, config: HealthCheckConfig): Promise<void> {
    await this.http.put(`/loadbalancer/${lbUUID}/listeners/${listenerUUID}/health-check`, config);
  }

  async deleteHealthCheck(lbUUID: string, listenerUUID: string): Promise<void> {
    await this.http.delete(`/loadbalancer/${lbUUID}/listeners/${listenerUUID}/health-check`);
  }
}
