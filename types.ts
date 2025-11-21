export interface ClashProxy {
  name: string;
  type: string;
  server: string;
  port: number | string;
  uuid?: string;
  cipher?: string;
  password?: string;
  udp?: boolean;
  network?: string;
  [key: string]: any;
}

export interface ClashConfig {
  port?: number;
  'socks-port'?: number;
  'redir-port'?: number;
  'allow-lan'?: boolean;
  mode?: string;
  'log-level'?: string;
  proxies?: ClashProxy[];
  'proxy-groups'?: any[];
  rules?: string[];
}

export interface SubscriptionSource {
  id: string;
  url: string;
  enabled: boolean;
  name: string;
}

export interface NodeStats {
  total: number;
  byType: Record<string, number>;
}