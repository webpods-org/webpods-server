import { AsymmetricAlgorithm, SymmetricAlgorithm } from "./crypto";

export type ExternalAuthServers = {
  allow: boolean;
  allowList?: string[];
  denyList?: string[];
};

export type JwksEndpoint = {
  type: "jwks";
  issuer: string;
  url: string;
};

export type StreamType = "websocket";

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

export type PodConfig = {
  claims: JwtClaims;
  hostname: string;
  alias?: string[];
  permissions?: PermissionGrant[];
  dataDir: string;
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

export type SqliteStorageConfig = {
  type: "sqlite";
  dataDir: string;
  dirNesting: number[];
};

export type StorageConfig = SqliteStorageConfig;

export type Tier = {
  type: string;
  maxSpaceMB: number;
  claims: {
    [key: string]: unknown;
  };
};

export type LocallyDefinedSymmetricJwtKey = {
  kid: string;
  issuer: string;
  alg: SymmetricAlgorithm;
  secret: string;
};
export type LocallyDefinedAsymmetricJwtKey = {
  kid: string;
  issuer: string;
  alg: AsymmetricAlgorithm;
  publicKey: string;
};

export type LocallyDefinedJwtKeys =
  | LocallyDefinedSymmetricJwtKey
  | LocallyDefinedAsymmetricJwtKey;

export type AppConfig = {
  hostname: string;
  externalAuthServers: ExternalAuthServers;
  jwksEndpoints?: JwksEndpoint[];
  jwks: {
    keys: JWK[];
  };
  jwksCacheSize?: number;
  jwtKeys?: LocallyDefinedJwtKeys[];
  streams: StreamType[];
  tiers: Tier[];
  storage: StorageConfig;
};
