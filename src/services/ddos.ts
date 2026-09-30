import { HttpClient } from '../client';
import { DDoSAttack } from '../types';

export class DDoSService {
  constructor(private readonly http: HttpClient) {}

  /** Recent attacks against your IPs; empty when there are none. */
  async listAttacks(): Promise<DDoSAttack[]> {
    const res = await this.http.get<DDoSAttack[] | { detail: string }>('/ddos-attacks/attacks');
    return Array.isArray(res) ? res : [];
  }

  /** Details of an attack as reported by the detection system (free-form). */
  async getAttackDetails(attackId: number | string): Promise<unknown> {
    return this.http.get<unknown>(`/ddos-attacks/attacks/${attackId}/details`);
  }

  /** Traffic time series over the duration of an attack (free-form). */
  async getAttackTrafficGraph(attackId: number | string): Promise<unknown> {
    return this.http.get<unknown>(`/ddos-attacks/attacks/${attackId}/traffic-graph`);
  }
}
