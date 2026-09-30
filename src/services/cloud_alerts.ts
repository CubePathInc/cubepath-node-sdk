import { HttpClient } from '../client';
import {
  CloudAlert,
  CloudAlertSummary,
  ListCloudAlertsParams,
  CreateCloudAlertRequest,
  UpdateCloudAlertRequest,
  CloudAlertHistoryEvent,
  Notificator,
  CreateNotificatorRequest,
  UpdateNotificatorRequest,
} from '../types';

/** Notification channels (Slack, Discord or email) the alerts send to. */
export class NotificatorsService {
  constructor(private readonly http: HttpClient) {}

  /** Webhook URLs come back masked. */
  async list(): Promise<Notificator[]> {
    return this.http.get<Notificator[]>('/triggers/notificators/');
  }

  async get(notificatorId: string): Promise<Notificator> {
    return this.http.get<Notificator>(`/triggers/notificators/${notificatorId}`);
  }

  async create(req: CreateNotificatorRequest): Promise<Notificator> {
    return this.http.post<Notificator>('/triggers/notificators/', req);
  }

  async update(notificatorId: string, req: UpdateNotificatorRequest): Promise<Notificator> {
    return this.http.put<Notificator>(`/triggers/notificators/${notificatorId}`, req);
  }

  /** Fails while an alert still uses the channel. */
  async delete(notificatorId: string): Promise<void> {
    await this.http.delete(`/triggers/notificators/${notificatorId}`);
  }
}

/** Alerts on a metric of a VPS, baremetal or availability group. */
export class CloudAlertsService {
  public readonly notificators: NotificatorsService;

  constructor(private readonly http: HttpClient) {
    this.notificators = new NotificatorsService(http);
  }

  async list(params?: ListCloudAlertsParams): Promise<CloudAlertSummary[]> {
    const query: Record<string, string> = {};
    if (params?.project_id !== undefined) query.project_id = String(params.project_id);
    if (params?.status) query.status = params.status;
    return this.http.get<CloudAlertSummary[]>('/triggers/', Object.keys(query).length ? query : undefined);
  }

  async get(alertId: string): Promise<CloudAlert> {
    return this.http.get<CloudAlert>(`/triggers/${alertId}`);
  }

  async create(req: CreateCloudAlertRequest): Promise<CloudAlert> {
    return this.http.post<CloudAlert>('/triggers/', req);
  }

  async update(alertId: string, req: UpdateCloudAlertRequest): Promise<CloudAlert> {
    return this.http.put<CloudAlert>(`/triggers/${alertId}`, req);
  }

  async delete(alertId: string): Promise<void> {
    await this.http.delete(`/triggers/${alertId}`);
  }

  /** Fired and recovered events, newest first (limit 1-200, default 50). */
  async history(alertId: string, limit?: number): Promise<CloudAlertHistoryEvent[]> {
    const query = limit !== undefined ? { limit: String(limit) } : undefined;
    return this.http.get<CloudAlertHistoryEvent[]>(`/triggers/${alertId}/history`, query);
  }
}
