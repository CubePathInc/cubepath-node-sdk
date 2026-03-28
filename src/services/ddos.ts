import { HttpClient } from '../client';
import { DDoSAttack } from '../types';

export class DDoSService {
  constructor(private readonly http: HttpClient) {}

  async listAttacks(): Promise<DDoSAttack[]> {
    return this.http.get<DDoSAttack[]>('/ddos-attacks/attacks');
  }
}
