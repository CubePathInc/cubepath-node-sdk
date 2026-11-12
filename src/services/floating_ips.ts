import { HttpClient } from '../client';
import { baremetalTarget } from '../baremetal_ref';
import { FloatingIP, FloatingIPsResponse } from '../types';

export class FloatingIPsService {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<FloatingIPsResponse> {
    return this.http.get<FloatingIPsResponse>('/floating_ips/organization');
  }

  async acquire(ipType: string, locationName: string): Promise<FloatingIP> {
    return this.http.post<FloatingIP>('/floating_ips/acquire', undefined, {
      ip_type: ipType,
      location_name: locationName,
    });
  }

  async release(address: string): Promise<void> {
    await this.http.post(`/floating_ips/release/${address}`);
  }

  /** Assign an owned IP to a server: the VPS id, or the uuid of a baremetal server. */
  async assign(resourceType: string, resourceId: string, address: string): Promise<void> {
    const ref = baremetalTarget(resourceType, resourceId);
    await this.http.post(`/floating_ips/assign/${resourceType}/${ref}`, undefined, { address });
  }

  async unassign(address: string): Promise<void> {
    await this.http.post(`/floating_ips/unassign/${address}`);
  }

  async configureReverseDNS(ip: string, reverseDNS: string): Promise<void> {
    await this.http.post('/floating_ips/reverse_dns/configure', undefined, {
      ip,
      reverse_dns: reverseDNS,
    });
  }
}
