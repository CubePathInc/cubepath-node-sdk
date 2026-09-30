import { HttpClient } from '../client';
import {
  DetailResponse,
  DDoSIPList,
  ListDDoSIPsParams,
  DDoSProtectionProfile,
  DDoSProtectionProfileSettings,
  DDoSCountry,
  DDoSASN,
  DDoSPrefixList,
  CreateDDoSPrefixListRequest,
  DDoSFirewallRule,
  CreateDDoSFirewallRuleRequest,
  DeleteDDoSFirewallRulesParams,
  DDoSTrafficCaptureIP,
  DDoSTrafficStatsRequest,
  DDoSTrafficStats,
  DDoSTrafficCaptureRequest,
  DDoSTrafficCapture,
} from '../types';

/** Per IP XDP firewall rules. Only IPs with Premium DDoS protection accept rules. */
export class DDoSFirewallService {
  constructor(private readonly http: HttpClient) {}

  async list(network: string): Promise<DDoSFirewallRule[]> {
    const res = await this.http.get<{ rules: DDoSFirewallRule[] }>(`/ddos-mitigation/firewall-rules/${network}`);
    return res.rules;
  }

  /** A subnet (/24 or smaller) creates the rule on every IP of it. */
  async create(req: CreateDDoSFirewallRuleRequest): Promise<DetailResponse> {
    return this.http.post<DetailResponse>('/ddos-mitigation/firewall-rules', req);
  }

  async delete(ruleId: number | string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/ddos-mitigation/firewall-rules/${ruleId}`);
  }

  /** Delete the rules matching network, protocol and port (on every IP of a subnet). */
  async deleteMatching(params: DeleteDDoSFirewallRulesParams): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>('/ddos-mitigation/firewall-rules/bulk', undefined, {
      network: params.network,
      protocol: String(params.protocol),
      dst_port: String(params.dst_port),
    });
  }
}

/** Named lists of networks for the prefix list mode of a profile. */
export class DDoSPrefixListsService {
  constructor(private readonly http: HttpClient) {}

  /** Your lists and the global ones provided by CubePath (is_global). */
  async list(): Promise<DDoSPrefixList[]> {
    const res = await this.http.get<{ prefix_lists: DDoSPrefixList[] }>('/ddos-mitigation/prefix-lists');
    return res.prefix_lists;
  }

  /** The API answers only a message: find the new list by name with list(). */
  async create(req: CreateDDoSPrefixListRequest): Promise<DetailResponse> {
    return this.http.post<DetailResponse>('/ddos-mitigation/prefix-lists', req);
  }

  async delete(uuid: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/ddos-mitigation/prefix-lists/${uuid}`);
  }

  async listEntries(uuid: string): Promise<string[]> {
    const res = await this.http.get<Array<{ network: string }>>(`/ddos-mitigation/prefix-lists/${uuid}/entries`);
    return res.map((e) => e.network);
  }

  /** Add a network in CIDR form, e.g. 203.0.113.0/24. */
  async addEntry(uuid: string, network: string): Promise<DetailResponse> {
    return this.http.post<DetailResponse>(`/ddos-mitigation/prefix-lists/${uuid}/entries`, { network });
  }

  async deleteEntry(uuid: string, network: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/ddos-mitigation/prefix-lists/${uuid}/entries/${network}`);
  }
}

/** Packets seen by the scrubbers for your protected IPs. */
export class DDoSTrafficService {
  constructor(private readonly http: HttpClient) {}

  /** The IPs whose traffic can be queried. */
  async listProtectedIPs(): Promise<DDoSTrafficCaptureIP[]> {
    const res = await this.http.get<{ ips: DDoSTrafficCaptureIP[] }>('/ddos-mitigation/traffic-capture/protected-ips');
    return res.ips;
  }

  /** Passed and dropped traffic over time. */
  async stats(req: DDoSTrafficStatsRequest): Promise<DDoSTrafficStats> {
    return this.http.post<DDoSTrafficStats>('/ddos-mitigation/traffic-capture/stats', req);
  }

  /** Sampled packets sent to one of your IPs or subnets. */
  async capture(req: DDoSTrafficCaptureRequest): Promise<DDoSTrafficCapture> {
    return this.http.post<DDoSTrafficCapture>('/ddos-mitigation/traffic-capture', req);
  }
}

/**
 * DDoS mitigation settings of your IPs with Premium protection. `network` is an IP address
 * or a subnet in CIDR form.
 */
export class DDoSMitigationService {
  public readonly firewall: DDoSFirewallService;
  public readonly prefixLists: DDoSPrefixListsService;
  public readonly traffic: DDoSTrafficService;

  constructor(private readonly http: HttpClient) {
    this.firewall = new DDoSFirewallService(http);
    this.prefixLists = new DDoSPrefixListsService(http);
    this.traffic = new DDoSTrafficService(http);
  }

  /** Your IPs with Premium protection, split into single IPs and subnets. */
  async listIPs(params?: ListDDoSIPsParams): Promise<DDoSIPList> {
    const query: Record<string, string> = {};
    if (params?.ip_type) query.ip_type = params.ip_type;
    if (params?.location) query.location = params.location;
    if (params?.has_profile !== undefined) query.has_profile = String(params.has_profile);
    return this.http.get<DDoSIPList>('/ddos-mitigation/ips', Object.keys(query).length ? query : undefined);
  }

  /** The profile of an IP or subnet; the defaults when none was saved. */
  async getProfile(network: string): Promise<DDoSProtectionProfile> {
    return this.http.get<DDoSProtectionProfile>(`/ddos-mitigation/profiles/${network}`);
  }

  /** Create or replace the profile. Omitted fields take their default value. */
  async updateProfile(network: string, settings: DDoSProtectionProfileSettings): Promise<DetailResponse> {
    return this.http.put<DetailResponse>(`/ddos-mitigation/profiles/${network}`, settings);
  }

  /** Remove the profile, back to the default protection. */
  async deleteProfile(network: string): Promise<DetailResponse> {
    return this.http.delete<DetailResponse>(`/ddos-mitigation/profiles/${network}`);
  }

  async getProfileCountries(network: string): Promise<DDoSCountry[]> {
    const res = await this.http.get<{ countries: DDoSCountry[] }>(`/ddos-mitigation/profiles/${network}/countries`);
    return res.countries;
  }

  /** Replace the countries of the profile (used by its country_mode). */
  async setProfileCountries(network: string, isoCodes: string[]): Promise<DetailResponse> {
    return this.http.put<DetailResponse>(`/ddos-mitigation/profiles/${network}/countries`, { iso_codes: isoCodes });
  }

  async getProfileASNs(network: string): Promise<DDoSASN[]> {
    const res = await this.http.get<{ asns: DDoSASN[] }>(`/ddos-mitigation/profiles/${network}/asns`);
    return res.asns;
  }

  /** Replace the ASNs of the profile (used by its asn_mode). */
  async setProfileASNs(network: string, asns: number[]): Promise<DetailResponse> {
    return this.http.put<DetailResponse>(`/ddos-mitigation/profiles/${network}/asns`, { asns });
  }

  async getProfilePrefixLists(network: string): Promise<DDoSPrefixList[]> {
    const res = await this.http.get<{ prefix_lists: DDoSPrefixList[] }>(
      `/ddos-mitigation/profiles/${network}/prefix-lists`,
    );
    return res.prefix_lists;
  }

  /** Replace the prefix lists of the profile (used by its prefix_list_mode). */
  async setProfilePrefixLists(network: string, uuids: string[]): Promise<DetailResponse> {
    return this.http.put<DetailResponse>(`/ddos-mitigation/profiles/${network}/prefix-lists`, { uuids });
  }

  /** Countries available for geo filtering. */
  async listCountries(): Promise<DDoSCountry[]> {
    const res = await this.http.get<{ countries: DDoSCountry[] }>('/ddos-mitigation/countries');
    return res.countries;
  }

  /** ASNs available for filtering, optionally searched by number or name. */
  async listASNs(search?: string): Promise<DDoSASN[]> {
    const res = await this.http.get<{ asns: DDoSASN[] }>('/ddos-mitigation/asns', search ? { search } : undefined);
    return res.asns;
  }
}
