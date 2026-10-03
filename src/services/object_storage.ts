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
  ObjectStorageEventDestination,
  ObjectStorageEventDestinationSecret,
  CreateObjectStorageEventDestinationRequest,
  UpdateObjectStorageEventDestinationRequest,
  ListObjectStorageEventDeliveriesParams,
  ObjectStorageEventDeliveries,
  ObjectStorageEventRule,
  CreateObjectStorageEventRuleRequest,
  UpdateObjectStorageEventRuleRequest,
  ObjectStorageReplication,
  ObjectStorageReplicationDetail,
  ListObjectStorageReplicationsParams,
  CreateObjectStorageReplicationRequest,
  CreateObjectStorageReplicationResponse,
  UpdateObjectStorageReplicationRequest,
  ObjectStorageReplicationGrant,
  CreateObjectStorageReplicationGrantRequest,
  CreateObjectStorageReplicationGrantResponse,
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

  // Event notifications

  async listEventDestinations(): Promise<ObjectStorageEventDestination[]> {
    return this.http.get<ObjectStorageEventDestination[]>('/object-storage/event-destinations');
  }

  /** The signing secret is only returned here and by rotateEventDestinationSecret: store it. */
  async createEventDestination(req: CreateObjectStorageEventDestinationRequest): Promise<ObjectStorageEventDestinationSecret> {
    return this.http.post<ObjectStorageEventDestinationSecret>('/object-storage/event-destinations', req);
  }

  async getEventDestination(uuid: string): Promise<ObjectStorageEventDestination> {
    return this.http.get<ObjectStorageEventDestination>(`/object-storage/event-destinations/${uuid}`);
  }

  async updateEventDestination(uuid: string, req: UpdateObjectStorageEventDestinationRequest): Promise<ObjectStorageEventDestination> {
    return this.http.patch<ObjectStorageEventDestination>(`/object-storage/event-destinations/${uuid}`, req);
  }

  /** Only a destination without rules can be deleted. */
  async deleteEventDestination(uuid: string): Promise<void> {
    await this.http.delete(`/object-storage/event-destinations/${uuid}`);
  }

  /** Issues a new signing secret; the previous one keeps signing for 24 hours. */
  async rotateEventDestinationSecret(uuid: string): Promise<ObjectStorageEventDestinationSecret> {
    return this.http.post<ObjectStorageEventDestinationSecret>(`/object-storage/event-destinations/${uuid}/rotate-secret`);
  }

  /** Delivers a cubepath.ping now (the destination must be active); the outcome shows up in the delivery history. */
  async testEventDestination(uuid: string): Promise<{ detail: string }> {
    return this.http.post<{ detail: string }>(`/object-storage/event-destinations/${uuid}/test`);
  }

  /** A page of the delivery history, newest first; page back with `before: next_before`. */
  async listEventDeliveries(uuid: string, params?: ListObjectStorageEventDeliveriesParams): Promise<ObjectStorageEventDeliveries> {
    const query: Record<string, string> = {};
    if (params?.status) query.status = params.status;
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.before !== undefined) query.before = String(params.before);
    return this.http.get<ObjectStorageEventDeliveries>(
      `/object-storage/event-destinations/${uuid}/deliveries`,
      Object.keys(query).length ? query : undefined,
    );
  }

  async listEventRules(bucketUuid: string): Promise<ObjectStorageEventRule[]> {
    return this.http.get<ObjectStorageEventRule[]>(`/object-storage/buckets/${bucketUuid}/event-rules`);
  }

  /** The rule is applied asynchronously: status goes from "pending" to "active". */
  async createEventRule(bucketUuid: string, req: CreateObjectStorageEventRuleRequest): Promise<ObjectStorageEventRule> {
    return this.http.post<ObjectStorageEventRule>(`/object-storage/buckets/${bucketUuid}/event-rules`, req);
  }

  async updateEventRule(bucketUuid: string, ruleUuid: string, req: UpdateObjectStorageEventRuleRequest): Promise<ObjectStorageEventRule> {
    return this.http.patch<ObjectStorageEventRule>(`/object-storage/buckets/${bucketUuid}/event-rules/${ruleUuid}`, req);
  }

  async deleteEventRule(bucketUuid: string, ruleUuid: string): Promise<void> {
    await this.http.delete(`/object-storage/buckets/${bucketUuid}/event-rules/${ruleUuid}`);
  }

  // Replication

  /** Outgoing and incoming replications of the organization, newest first. */
  async listReplications(params?: ListObjectStorageReplicationsParams): Promise<ObjectStorageReplication[]> {
    const query: Record<string, string> = {};
    if (params?.direction) query.direction = params.direction;
    if (params?.bucket_uuid) query.bucket_uuid = params.bucket_uuid;
    return this.http.get<ObjectStorageReplication[]>(
      '/object-storage/replications',
      Object.keys(query).length ? query : undefined,
    );
  }

  /** Detail of a replication of one of your buckets, with health, backfill and metrics. */
  async getReplication(uuid: string): Promise<ObjectStorageReplicationDetail> {
    return this.http.get<ObjectStorageReplicationDetail>(`/object-storage/replications/${uuid}`);
  }

  /**
   * Replicates a bucket to one destination, asynchronously: it works once its status is "active".
   * Versioning must be enabled on the source (and on a CubePath destination); buckets with
   * Object Lock cannot be sources. A CubePath destination lives on the same cluster, so it is not
   * an off site copy; replication to an external destination is billed as egress.
   */
  async createReplication(req: CreateObjectStorageReplicationRequest): Promise<CreateObjectStorageReplicationResponse> {
    return this.http.post<CreateObjectStorageReplicationResponse>('/object-storage/replications', req);
  }

  /**
   * Changes the rules, pauses (enabled: false) or resumes, or rotates the credentials of an
   * external destination. Omitted fields are kept; prefix: null and tags: null remove the filter.
   */
  async updateReplication(uuid: string, req: UpdateObjectStorageReplicationRequest): Promise<void> {
    await this.http.patch(`/object-storage/replications/${uuid}`, req);
  }

  /** Removes the replication asynchronously. Data already replicated stays in the destination. */
  async deleteReplication(uuid: string): Promise<void> {
    await this.http.delete(`/object-storage/replications/${uuid}`);
  }

  /**
   * Sends the existing objects again (only those older than olderThanDays when given). The
   * replication must be active and replicate existing objects.
   */
  async resyncReplication(uuid: string, olderThanDays?: number | null): Promise<void> {
    await this.http.post(`/object-storage/replications/${uuid}/resync`, { older_than_days: olderThanDays ?? null });
  }

  /** As the owner of the destination bucket, stops an incoming replication of another organization. */
  async revokeReplication(uuid: string): Promise<void> {
    await this.http.post(`/object-storage/replications/${uuid}/revoke`);
  }

  // Replication grants

  /**
   * Lets another organization replicate into the bucket once. The token is only returned by this
   * call; it expires after expires_in_days (default 7) and can be revoked until it is used.
   */
  async createReplicationGrant(
    bucketUuid: string,
    req: CreateObjectStorageReplicationGrantRequest = {},
  ): Promise<CreateObjectStorageReplicationGrantResponse> {
    return this.http.post<CreateObjectStorageReplicationGrantResponse>(
      `/object-storage/buckets/${bucketUuid}/replication-grants`,
      req,
    );
  }

  /** Every grant of the bucket, newest first (never the token). */
  async listReplicationGrants(bucketUuid: string): Promise<ObjectStorageReplicationGrant[]> {
    return this.http.get<ObjectStorageReplicationGrant[]>(`/object-storage/buckets/${bucketUuid}/replication-grants`);
  }

  /** Revokes a grant that was not used yet. */
  async deleteReplicationGrant(uuid: string): Promise<void> {
    await this.http.delete(`/object-storage/replication-grants/${uuid}`);
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
