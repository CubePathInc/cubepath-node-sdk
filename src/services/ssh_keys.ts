import { HttpClient } from '../client';
import { SSHKey, CreateSSHKeyRequest, UpdateSSHKeyResponse } from '../types';

export class SSHKeysService {
  constructor(private readonly http: HttpClient) {}

  async create(req: CreateSSHKeyRequest): Promise<SSHKey> {
    return this.http.post<SSHKey>('/sshkey/create', req);
  }

  async list(): Promise<SSHKey[]> {
    const res = await this.http.get<SSHKey[] | { sshkeys: SSHKey[] }>('/sshkey/user/sshkeys');
    return Array.isArray(res) ? res : res.sshkeys;
  }

  /** Rename a key; the key material cannot change. */
  async update(keyId: string | number, name: string): Promise<UpdateSSHKeyResponse> {
    return this.http.put<UpdateSSHKeyResponse>(`/sshkey/${keyId}`, { name });
  }

  async delete(keyId: string): Promise<void> {
    await this.http.delete(`/sshkey/${keyId}`);
  }
}
