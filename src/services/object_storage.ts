import { HttpClient } from '../client';
import {
  ObjectStorageTier,
  ObjectStorageBucket,
  ObjectStorageBucketDetail,
  ObjectStorageAccessKey,
  ObjectStorageUsage,
  ListObjectStorageParams,
  ObjectStorageUsageParams,
  CreateObjectStorageBucketRequest,
  CreateObjectStorageBucketResponse,
  UpdateObjectStorageBucketRequest,
  CreateObjectStorageAccessKeyRequest,
  CreateObjectStorageAccessKeyResponse,
} from '../types';

function toQuery(params?: ObjectStorageUsageParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const query: Record<string, string> = {};
  if (params.project_id !== undefined) query.project_id = String(params.project_id);
  if (params.tier) query.tier = params.tier;
  if (params.period) query.period = params.period;
  return Object.keys(query).length ? query : undefined;
}

export class ObjectStorageService {
  constructor(private readonly http: HttpClient) {}

  // Tiers

  async listTiers(): Promise<ObjectStorageTier[]> {
    return this.http.get<ObjectStorageTier[]>('/object-storage/tiers');
  }

  // Buckets

  async listBuckets(params?: ListObjectStorageParams): Promise<ObjectStorageBucket[]> {
    return this.http.get<ObjectStorageBucket[]>('/object-storage/buckets', toQuery(params));
  }

  async getBucket(uuid: string): Promise<ObjectStorageBucketDetail> {
    return this.http.get<ObjectStorageBucketDetail>(`/object-storage/buckets/${uuid}`);
  }

  /** Creates the bucket asynchronously: it is usable once its status is "active". */
  async createBucket(req: CreateObjectStorageBucketRequest): Promise<CreateObjectStorageBucketResponse> {
    return this.http.post<CreateObjectStorageBucketResponse>('/object-storage/buckets', req);
  }

  async updateBucket(uuid: string, req: UpdateObjectStorageBucketRequest): Promise<void> {
    await this.http.patch(`/object-storage/buckets/${uuid}`, req);
  }

  /**
   * Deletes the bucket asynchronously. Without force only an empty bucket is deleted;
   * with force every object and version is purged first.
   */
  async deleteBucket(uuid: string, options?: { force?: boolean }): Promise<void> {
    const query = options?.force ? { force: 'true' } : undefined;
    await this.http.request('DELETE', `/object-storage/buckets/${uuid}`, undefined, query);
  }

  // Access keys

  async listKeys(params?: ListObjectStorageParams): Promise<ObjectStorageAccessKey[]> {
    return this.http.get<ObjectStorageAccessKey[]>('/object-storage/keys', toQuery(params));
  }

  /** The secret is only returned by this call. The key works once its status is "active". */
  async createKey(req: CreateObjectStorageAccessKeyRequest): Promise<CreateObjectStorageAccessKeyResponse> {
    return this.http.post<CreateObjectStorageAccessKeyResponse>('/object-storage/keys', req);
  }

  async deleteKey(uuid: string): Promise<void> {
    await this.http.delete(`/object-storage/keys/${uuid}`);
  }

  // Usage

  async getUsage(params?: ObjectStorageUsageParams): Promise<ObjectStorageUsage> {
    return this.http.get<ObjectStorageUsage>('/object-storage/usage', toQuery(params));
  }
}
