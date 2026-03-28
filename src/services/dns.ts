import { HttpClient } from '../client';
import {
  DNSZone,
  DNSRecord,
  SOARecord,
  ZoneVerifyResponse,
  ZoneScanResponse,
  CreateDNSZoneRequest,
  CreateDNSRecordRequest,
  UpdateDNSRecordRequest,
  UpdateSOARequest,
} from '../types';

export class DNSService {
  constructor(private readonly http: HttpClient) {}

  // Zone operations

  async listZones(): Promise<DNSZone[]> {
    return this.http.get<DNSZone[]>('/dns/zones');
  }

  async listZonesByProject(projectId: string): Promise<DNSZone[]> {
    return this.http.get<DNSZone[]>('/dns/zones', { project_id: projectId });
  }

  async getZone(zoneUUID: string): Promise<DNSZone> {
    return this.http.get<DNSZone>(`/dns/zones/${zoneUUID}`);
  }

  async createZone(req: CreateDNSZoneRequest): Promise<DNSZone> {
    return this.http.post<DNSZone>('/dns/zones', req);
  }

  async deleteZone(zoneUUID: string): Promise<void> {
    await this.http.delete(`/dns/zones/${zoneUUID}`);
  }

  async verifyZone(zoneUUID: string): Promise<ZoneVerifyResponse> {
    return this.http.post<ZoneVerifyResponse>(`/dns/zones/${zoneUUID}/verify`);
  }

  async scanZone(zoneUUID: string, autoImport = false): Promise<ZoneScanResponse> {
    return this.http.post<ZoneScanResponse>(`/dns/zones/${zoneUUID}/scan`, undefined, {
      auto_import: String(autoImport),
    });
  }

  // Record operations

  async listRecords(zoneUUID: string): Promise<DNSRecord[]> {
    return this.http.get<DNSRecord[]>(`/dns/zones/${zoneUUID}/records`);
  }

  async listRecordsByType(zoneUUID: string, recordType: string): Promise<DNSRecord[]> {
    return this.http.get<DNSRecord[]>(`/dns/zones/${zoneUUID}/records`, { record_type: recordType });
  }

  async createRecord(zoneUUID: string, req: CreateDNSRecordRequest): Promise<DNSRecord> {
    return this.http.post<DNSRecord>(`/dns/zones/${zoneUUID}/records`, req);
  }

  async updateRecord(zoneUUID: string, recordUUID: string, req: UpdateDNSRecordRequest): Promise<DNSRecord> {
    return this.http.put<DNSRecord>(`/dns/zones/${zoneUUID}/records/${recordUUID}`, req);
  }

  async deleteRecord(zoneUUID: string, recordUUID: string): Promise<void> {
    await this.http.delete(`/dns/zones/${zoneUUID}/records/${recordUUID}`);
  }

  // SOA operations

  async getSOA(zoneUUID: string): Promise<SOARecord> {
    return this.http.get<SOARecord>(`/dns/zones/${zoneUUID}/soa`);
  }

  async updateSOA(zoneUUID: string, req: UpdateSOARequest): Promise<SOARecord> {
    return this.http.put<SOARecord>(`/dns/zones/${zoneUUID}/soa`, req);
  }
}
