import { CubePath, CubePathError } from './index';

describe('CubePath', () => {
  it('should create a client with all services', () => {
    const client = new CubePath({ apiKey: 'test-key' });

    expect(client.projects).toBeDefined();
    expect(client.sshKeys).toBeDefined();
    expect(client.vps).toBeDefined();
    expect(client.vps.backups).toBeDefined();
    expect(client.vps.isos).toBeDefined();
    expect(client.baremetal).toBeDefined();
    expect(client.networks).toBeDefined();
    expect(client.floatingIPs).toBeDefined();
    expect(client.firewall).toBeDefined();
    expect(client.dns).toBeDefined();
    expect(client.loadBalancer).toBeDefined();
    expect(client.cdn).toBeDefined();
    expect(client.cdn.waf).toBeDefined();
    expect(client.kubernetes).toBeDefined();
    expect(client.kubernetes.nodePools).toBeDefined();
    expect(client.kubernetes.addons).toBeDefined();
    expect(client.pricing).toBeDefined();
    expect(client.ddos).toBeDefined();
  });
});

describe('CubePathError', () => {
  it('should identify error types correctly', () => {
    const notFound = new CubePathError(404, 'Not found');
    const conflict = new CubePathError(409, 'Conflict');
    const rateLimited = new CubePathError(429, 'Too many requests');
    const badRequest = new CubePathError(400, 'Bad request');
    const serverError = new CubePathError(500, 'Internal server error');

    expect(CubePathError.isNotFound(notFound)).toBe(true);
    expect(CubePathError.isNotFound(conflict)).toBe(false);

    expect(CubePathError.isConflict(conflict)).toBe(true);
    expect(CubePathError.isRateLimited(rateLimited)).toBe(true);
    expect(CubePathError.isBadRequest(badRequest)).toBe(true);
    expect(CubePathError.isServerError(serverError)).toBe(true);

    expect(CubePathError.isServerError(notFound)).toBe(false);
    expect(CubePathError.isNotFound(new Error('generic'))).toBe(false);
  });

  it('should store status code, message, and detail', () => {
    const err = new CubePathError(422, 'Validation failed', 'name is required');

    expect(err.statusCode).toBe(422);
    expect(err.message).toBe('Validation failed');
    expect(err.detail).toBe('name is required');
    expect(err.name).toBe('CubePathError');
  });
});
