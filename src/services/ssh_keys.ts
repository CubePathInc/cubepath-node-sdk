import { HttpClient } from '../client';
import { SSHKey, CreateSSHKeyRequest } from '../types';

export class SSHKeysService {
  constructor(private readonly http: HttpClient) {}

  async create(req: CreateSSHKeyRequest): Promise<SSHKey> {
    return this.http.post<SSHKey>('/sshkey/create', req);
  }

  async list(): Promise<SSHKey[]> {
    return this.http.get<SSHKey[]>('/sshkey/user/sshkeys');
  }

  async delete(keyId: string): Promise<void> {
    await this.http.delete(`/sshkey/${keyId}`);
  }
}
