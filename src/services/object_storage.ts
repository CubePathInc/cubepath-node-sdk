import { HttpClient } from '../client';
import { CubePathError } from '../errors';
import {
  MetricsTimeRange,
  ObjectStorageBucketMetrics,
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
  ObjectStorageLifecycle,
  ObjectStorageLifecycleChange,
  ObjectStorageLifecycleRule,
  SetObjectStorageObjectLockRequest,
  DeleteObjectStorageBucketOptions,
  ObjectStorageEncryptionChange,
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
   * Changes or removes (default_retention null) the default retention of a bucket created with
   * Object Lock. Object Lock itself can only be enabled when the bucket is created.
   */
  async setBucketObjectLock(uuid: string, req: SetObjectStorageObjectLockRequest): Promise<void> {
    await this.http.put(`/object-storage/buckets/${uuid}/object-lock`, req);
  }

  /**
   * Turns on encryption at rest (AES-256) for a bucket created without it. The objects already
   * stored are encrypted in the background (reencrypt_job_id); in a versioned bucket only the
   * current versions are. It cannot be turned off afterwards; on an encrypted bucket nothing changes.
   */
  async enableBucketEncryption(uuid: string): Promise<ObjectStorageEncryptionChange> {
    return this.http.put<ObjectStorageEncryptionChange>(`/object-storage/buckets/${uuid}/encryption`, { enabled: true });
  }

  /**
   * Deletes the bucket asynchronously. Without force only an empty bucket is deleted;
   * with force every object and version is purged first. bypass_governance (only with force)
   * also deletes versions under governance retention; versions under compliance or a legal hold
   * are kept and the bucket comes back with locked_content_kept set.
   */
  async deleteBucket(uuid: string, options?: DeleteObjectStorageBucketOptions): Promise<void> {
    const query: Record<string, string> = {};
    if (options?.force) query.force = 'true';
    if (options?.bypass_governance) query.bypass_governance = 'true';
    await this.http.request(
      'DELETE',
      `/object-storage/buckets/${uuid}`,
      undefined,
      Object.keys(query).length ? query : undefined,
    );
  }

  // Lifecycle rules

  async getBucketLifecycle(uuid: string): Promise<ObjectStorageLifecycle> {
    return this.http.get<ObjectStorageLifecycle>(`/object-storage/buckets/${uuid}/lifecycle`);
  }

  /**
   * Replaces every lifecycle rule of the bucket (1 to 100). Expiration rules delete objects
   * permanently. Applied asynchronously: poll getBucketLifecycle until applied_generation
   * reaches the returned generation.
   */
  async putBucketLifecycle(uuid: string, rules: ObjectStorageLifecycleRule[]): Promise<ObjectStorageLifecycleChange> {
    return this.http.put<ObjectStorageLifecycleChange>(`/object-storage/buckets/${uuid}/lifecycle`, { rules });
  }

  /** Removes every lifecycle rule of the bucket. */
  async deleteBucketLifecycle(uuid: string): Promise<ObjectStorageLifecycleChange> {
    return this.http.delete<ObjectStorageLifecycleChange>(`/object-storage/buckets/${uuid}/lifecycle`);
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

  // Charts

  /**
   * Chart series of a bucket over H1, H3, H6, H12, H24 (default), D3, D7 or D30: stored size and
   * objects, billable traffic and every response by status class. Served through GraphQL.
   */
  async getBucketMetrics(uuid: string, range: MetricsTimeRange = 'H24'): Promise<ObjectStorageBucketMetrics> {
    const result = 'start end step series { name unit points { ts value } }';
    const data = await this.http.graphql<{ objectStorageBucket: ObjectStorageBucketMetrics | null }>(
      `query($uuid: ID!, $range: TimeRange!) { objectStorageBucket(uuid: $uuid) { uuid name storageMeasuredAt storage(range: $range) { ${result} } traffic(range: $range) { ${result} } responses(range: $range) { ${result} } } }`,
      { uuid, range },
    );
    if (!data?.objectStorageBucket) throw new CubePathError(404, 'Not Found', `Bucket ${uuid} not found`);
    return data.objectStorageBucket;
  }
}
