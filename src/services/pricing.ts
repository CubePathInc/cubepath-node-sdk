import { HttpClient } from '../client';
import { PricingResponse } from '../types';

export class PricingService {
  constructor(private readonly http: HttpClient) {}

  async get(): Promise<PricingResponse> {
    return this.http.get<PricingResponse>('/pricing');
  }
}
