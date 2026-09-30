import { HttpClient } from '../client';
import {
  DetailResponse,
  ManagedDatabase,
  ManagedDatabaseSummary,
  ManagedDatabaseLocationPlans,
  ManagedDatabaseEngine,
  CreateManagedDatabaseRequest,
  CreateManagedDatabaseResponse,
  UpdateManagedDatabaseRequest,
  ScaleManagedDatabaseRequest,
  ScaleManagedDatabaseResponse,
  ManagedDatabaseCredentials,
  ManagedDatabaseConfig,
  UpdateManagedDatabaseConfigResponse,
  ManagedDatabaseMetrics,
  ManagedDatabaseMetricsParams,
  ManagedDatabaseLogicalDatabase,
  CreateLogicalDatabaseResponse,
  ManagedDatabaseUser,
  CreateManagedDatabaseUserRequest,
  CreateManagedDatabaseUserResponse,
} from '../types';

/** Logical databases inside a MySQL or PostgreSQL instance (Valkey has none). */
export class ManagedDatabaseDatabasesService {
  constructor(private readonly http: HttpClient) {}

  async list(mdUUID: string): Promise<ManagedDatabaseLogicalDatabase[]> {
    return this.http.get<ManagedDatabaseLogicalDatabase[]>(`/managed-databases/${mdUUID}/databases`);
  }

  /** Created asynchronously: usable once its status is "active". */
  async create(mdUUID: string, name: string): Promise<CreateLogicalDatabaseResponse> {
    return this.http.post<CreateLogicalDatabaseResponse>(`/managed-databases/${mdUUID}/databases`, { name });
  }

  /** Drops the database and its data. */
  async delete(mdUUID: string, dbUUID: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/managed-databases/${mdUUID}/databases/${dbUUID}`);
  }
}

export class ManagedDatabaseUsersService {
  constructor(private readonly http: HttpClient) {}

  async list(mdUUID: string): Promise<ManagedDatabaseUser[]> {
    return this.http.get<ManagedDatabaseUser[]>(`/managed-databases/${mdUUID}/users`);
  }

  /** The password (yours, or a generated one) is only returned by this call. */
  async create(mdUUID: string, req: CreateManagedDatabaseUserRequest): Promise<CreateManagedDatabaseUserResponse> {
    return this.http.post<CreateManagedDatabaseUserResponse>(`/managed-databases/${mdUUID}/users`, req);
  }

  async delete(mdUUID: string, userUUID: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/managed-databases/${mdUUID}/users/${userUUID}`);
  }
}

export class ManagedDatabasesService {
  public readonly databases: ManagedDatabaseDatabasesService;
  public readonly users: ManagedDatabaseUsersService;

  constructor(private readonly http: HttpClient) {
    this.databases = new ManagedDatabaseDatabasesService(http);
    this.users = new ManagedDatabaseUsersService(http);
  }

  /** Plans grouped by location. Prices are per node per hour. */
  async listPlans(engine?: ManagedDatabaseEngine): Promise<ManagedDatabaseLocationPlans[]> {
    const query = engine ? { engine } : undefined;
    return this.http.get<ManagedDatabaseLocationPlans[]>('/managed-database-plans/', query);
  }

  async list(): Promise<ManagedDatabaseSummary[]> {
    return this.http.get<ManagedDatabaseSummary[]>('/managed-databases/');
  }

  async get(mdUUID: string): Promise<ManagedDatabase> {
    return this.http.get<ManagedDatabase>(`/managed-databases/${mdUUID}`);
  }

  /** Provisioned asynchronously: usable once its status is "active". */
  async create(req: CreateManagedDatabaseRequest): Promise<CreateManagedDatabaseResponse> {
    return this.http.post<CreateManagedDatabaseResponse>('/managed-databases/', req);
  }

  /** Change the name, label or backup policy. */
  async update(mdUUID: string, req: UpdateManagedDatabaseRequest): Promise<DetailResponse> {
    return this.http.patch<DetailResponse>(`/managed-databases/${mdUUID}`, req);
  }

  /** Deletes the database and all its data, asynchronously. */
  async delete(mdUUID: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/managed-databases/${mdUUID}`);
  }

  async setProtection(mdUUID: string, enabled: boolean): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/managed-databases/${mdUUID}/protection`, { enabled });
  }

  /** Change the replica count or move to another plan of the same engine and location. */
  async scale(mdUUID: string, req: ScaleManagedDatabaseRequest): Promise<ScaleManagedDatabaseResponse> {
    return this.http.post<ScaleManagedDatabaseResponse>(`/managed-databases/${mdUUID}/scale`, req);
  }

  /** Admin credentials and connection URI; needs a token with write access. */
  async getCredentials(mdUUID: string): Promise<ManagedDatabaseCredentials> {
    return this.http.get<ManagedDatabaseCredentials>(`/managed-databases/${mdUUID}/credentials`);
  }

  /** Generates a new admin password; read it with getCredentials once the database is active again. */
  async rotateCredentials(mdUUID: string): Promise<DetailResponse & { uuid: string }> {
    return this.http.post<DetailResponse & { uuid: string }>(`/managed-databases/${mdUUID}/credentials/rotate`);
  }

  /** The tunable parameters of the engine, with their type, bounds and defaults. */
  async getConfig(mdUUID: string): Promise<ManagedDatabaseConfig> {
    return this.http.get<ManagedDatabaseConfig>(`/managed-databases/${mdUUID}/config`);
  }

  async updateConfig(
    mdUUID: string,
    params: Record<string, string | number | boolean>,
  ): Promise<UpdateManagedDatabaseConfigResponse> {
    return this.http.patch<UpdateManagedDatabaseConfigResponse>(`/managed-databases/${mdUUID}/config`, { params });
  }

  async getMetrics(mdUUID: string, params?: ManagedDatabaseMetricsParams): Promise<ManagedDatabaseMetrics> {
    const query: Record<string, string> = {};
    if (params?.metrics?.length) query.metrics = params.metrics.join(',');
    if (params?.time_range) query.time_range = params.time_range;
    return this.http.get<ManagedDatabaseMetrics>(
      `/managed-databases/${mdUUID}/metrics`,
      Object.keys(query).length ? query : undefined,
    );
  }
}
