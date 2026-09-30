import { HttpClient } from '../client';
import {
  TranscoderJob,
  TranscoderJobList,
  TranscoderJobOutputs,
  TranscoderBatch,
  CreateTranscoderJobRequest,
  CreateTranscoderBatchRequest,
  ListTranscoderJobsParams,
} from '../types';

/** Video transcoding from a URL or an S3 compatible bucket into your own bucket. */
export class TranscoderService {
  constructor(private readonly http: HttpClient) {}

  /** The job runs asynchronously: poll getJob until its status is completed, failed or canceled. */
  async createJob(req: CreateTranscoderJobRequest): Promise<TranscoderJob> {
    return this.http.post<TranscoderJob>('/transcoder/jobs', req);
  }

  /** Up to 1000 inputs sharing the same outputs and destination. */
  async createBatch(req: CreateTranscoderBatchRequest): Promise<TranscoderBatch> {
    return this.http.post<TranscoderBatch>('/transcoder/jobs/batch', req);
  }

  async listJobs(params?: ListTranscoderJobsParams): Promise<TranscoderJobList> {
    const query: Record<string, string> = {};
    if (params?.batch_id) query.batch_id = params.batch_id;
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.offset !== undefined) query.offset = String(params.offset);
    return this.http.get<TranscoderJobList>('/transcoder/jobs', Object.keys(query).length ? query : undefined);
  }

  async getJob(uuid: string): Promise<TranscoderJob> {
    return this.http.get<TranscoderJob>(`/transcoder/jobs/${uuid}`);
  }

  /** The files a finished job wrote and where. */
  async getJobOutputs(uuid: string): Promise<TranscoderJobOutputs> {
    return this.http.get<TranscoderJobOutputs>(`/transcoder/jobs/${uuid}/outputs`);
  }

  /** Cancel a job that has not finished. */
  async cancelJob(uuid: string): Promise<{ detail: string; status: string }> {
    return this.http.delete<{ detail: string; status: string }>(`/transcoder/jobs/${uuid}`);
  }
}
