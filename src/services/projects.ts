import { HttpClient } from '../client';
import { Project, ProjectResponse, CreateProjectRequest } from '../types';

export class ProjectsService {
  constructor(private readonly http: HttpClient) {}

  async create(req: CreateProjectRequest): Promise<Project> {
    return this.http.post<Project>('/projects/', req);
  }

  async list(): Promise<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/projects/');
  }

  async get(projectId: string): Promise<ProjectResponse> {
    const projects = await this.list();
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    return project;
  }

  async delete(projectId: string): Promise<void> {
    await this.http.delete(`/projects/${projectId}`);
  }
}
