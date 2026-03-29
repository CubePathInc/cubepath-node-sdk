import { ClientOptions } from './types';
import { HttpClient } from './client';
import { ProjectsService } from './services/projects';
import { SSHKeysService } from './services/ssh_keys';
import { VPSService } from './services/vps';
import { BaremetalService } from './services/baremetal';
import { NetworksService } from './services/networks';
import { FloatingIPsService } from './services/floating_ips';
import { FirewallService } from './services/firewall';
import { DNSService } from './services/dns';
import { LoadBalancerService } from './services/loadbalancer';
import { CDNService } from './services/cdn';
import { KubernetesService } from './services/kubernetes';
import { PricingService } from './services/pricing';
import { DDoSService } from './services/ddos';
import { AIGatewayService } from './services/ai_gateway';

export class CubePath {
  public readonly projects: ProjectsService;
  public readonly sshKeys: SSHKeysService;
  public readonly vps: VPSService;
  public readonly baremetal: BaremetalService;
  public readonly networks: NetworksService;
  public readonly floatingIPs: FloatingIPsService;
  public readonly firewall: FirewallService;
  public readonly dns: DNSService;
  public readonly loadBalancer: LoadBalancerService;
  public readonly cdn: CDNService;
  public readonly kubernetes: KubernetesService;
  public readonly pricing: PricingService;
  public readonly ddos: DDoSService;
  public readonly aiGateway: AIGatewayService;

  constructor(options: ClientOptions) {
    const http = new HttpClient(options);

    this.projects = new ProjectsService(http);
    this.sshKeys = new SSHKeysService(http);
    this.vps = new VPSService(http);
    this.baremetal = new BaremetalService(http);
    this.networks = new NetworksService(http);
    this.floatingIPs = new FloatingIPsService(http);
    this.firewall = new FirewallService(http);
    this.dns = new DNSService(http);
    this.loadBalancer = new LoadBalancerService(http);
    this.cdn = new CDNService(http);
    this.kubernetes = new KubernetesService(http);
    this.pricing = new PricingService(http);
    this.ddos = new DDoSService(http);
    this.aiGateway = new AIGatewayService(http, options);
  }
}

export { CubePathError } from './errors';
export * from './types';
