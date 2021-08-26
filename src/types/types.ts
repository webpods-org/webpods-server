import { AsymmetricAlgorithm, SymmetricAlgorithm } from "./crypto";

export type ExternalAuthServers = {
  allow: boolean;
  allowList?: string[];
  denyList?: string[];
};

export type JwksEndpoint = {
  type: "jwks";
  iss: string;
  url: string;
};

export type JwtClaims = {
  iss: string;
  sub: string;
  webpods?: {
    hostname: string;
    pod: string;
  };
  [key: string]: unknown;
};

export type PermissionGrant = {
  claims: JwtClaims;
  read?: boolean;
  write?: boolean;
  metadata?: boolean;
  admin?: boolean;
};

export type JWK = {
  alg: string;
  kty: string;
  use: string;
  n?: string;
  e?: string;
  kid: string;
  x5t?: string;
  x5c?: string[];
};

export type StorageConfig = {
  dataDir: string;
  podsDirCount: 100;
  db: {
    type: "sqlite";
  };
};

export type Tier = {
  type: string;
  maxSpaceMB: number;
  maxPodsPerUser?: number;
  claims: {
    [key: string]: unknown;
  };
};

export type LocallyDefinedAsymmetricJwtKey = {
  kid: string;
  iss: string;
  alg: AsymmetricAlgorithm;
  publicKey: string;
};

export type PodInfo = {
  claims: {
    iss: string;
    sub: string;
  };
  name: string;
  hostname: string;
  hostnameAlias: string | null;
  createdAt: number;
  tier: string;
  permissions?: PermissionGrant[];
  description: string;
};

export type LogInfo = {
  log: string;
  public: boolean;
  createdAt: number;
  tags: string | null;
};

export type HttpsConfig = {
  key: string;
  cert: string;
  ca: string;
};

export type PubSubConfig = {
  maxConnections?: number;
};

export type AppConfig = {
  hostname: string;
  externalAuthServers: ExternalAuthServers;
  jwksEndpoints?: JwksEndpoint[];
  jwks: {
    keys: JWK[];
  };
  jwksCacheSize?: number;
  jwtKeys?: LocallyDefinedAsymmetricJwtKey[];
  tiers: Tier[];
  storage: StorageConfig;
  pods?: PodInfo[];
  podDbCacheSize?: number;
  maxFileSize?: number;
  useHttps?: HttpsConfig;
  pubsub?: PubSubConfig;
};

export type Permission = {
  claims: {
    iss: string;
    sub: string;
  };
  access: {
    read: boolean;
    write: boolean;
    admin: boolean;
    metadata: boolean;
    publish: boolean;
    subscribe: boolean;
  };
};

export type LogEntry = {
  id: number;
  contentHash: string;
  commit: string;
  previousCommit: string;
  data: string;
  type: "data" | "file";
  iss: string;
  sub: string;
};
