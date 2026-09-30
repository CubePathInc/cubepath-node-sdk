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
  DetailResponse,
  DNSRegion,
  DNSHealthCheck,
  UpsertDNSHealthCheckRequest,
  DNSImportResult,
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

  async moveZoneToProject(zoneUUID: string, projectId: number): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/dns/zones/${zoneUUID}/move-project`, { project_id: projectId });
  }

  /** GeoDNS regions a record can be answered in. */
  async listRegions(): Promise<DNSRegion[]> {
    return this.http.get<DNSRegion[]>('/dns/regions');
  }

  /** Create a zone and import the records found by querying public DNS for the domain. */
  async createZoneFromScan(domain: string, projectId: number): Promise<DNSImportResult> {
    return this.http.post<DNSImportResult>('/dns/zones/scan', undefined, { domain, project_id: String(projectId) });
  }

  /** Create a zone from a BIND zone file (UTF-8, at most 1 MB). */
  async createZoneFromFile(
    domain: string,
    projectId: number,
    zoneFile: string | Blob,
    filename = 'zone.txt',
  ): Promise<DNSImportResult> {
    return this.http.postFile<DNSImportResult>('/dns/zones/upload', 'file', zoneFile, filename, {
      domain,
      project_id: String(projectId),
    });
  }

  /** Import the records of a BIND zone file into an existing zone. NS and SOA are skipped. */
  async importZoneFile(zoneUUID: string, zoneFile: string | Blob, filename = 'zone.txt'): Promise<DNSImportResult> {
    return this.http.postFile<DNSImportResult>(`/dns/zones/${zoneUUID}/import`, 'file', zoneFile, filename);
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

  // Health checks (Pro and Business zones, A and AAAA records)

  async listHealthChecks(zoneUUID: string): Promise<DNSHealthCheck[]> {
    return this.http.get<DNSHealthCheck[]>(`/dns/zones/${zoneUUID}/health-checks`);
  }

  async getHealthCheck(zoneUUID: string, recordUUID: string): Promise<DNSHealthCheck> {
    return this.http.get<DNSHealthCheck>(`/dns/zones/${zoneUUID}/records/${recordUUID}/health-check`);
  }

  /** Create or replace the health check of a record. An unhealthy value is left out of the answers. */
  async setHealthCheck(
    zoneUUID: string,
    recordUUID: string,
    req: UpsertDNSHealthCheckRequest,
  ): Promise<DNSHealthCheck> {
    return this.http.put<DNSHealthCheck>(`/dns/zones/${zoneUUID}/records/${recordUUID}/health-check`, req);
  }

  async deleteHealthCheck(zoneUUID: string, recordUUID: string): Promise<void> {
    await this.http.delete(`/dns/zones/${zoneUUID}/records/${recordUUID}/health-check`);
  }

  // SOA operations

  async getSOA(zoneUUID: string): Promise<SOARecord> {
    return this.http.get<SOARecord>(`/dns/zones/${zoneUUID}/soa`);
  }

  async updateSOA(zoneUUID: string, req: UpdateSOARequest): Promise<SOARecord> {
    return this.http.put<SOARecord>(`/dns/zones/${zoneUUID}/soa`, req);
  }
}
