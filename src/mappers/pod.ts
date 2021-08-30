import { PodInfo } from "../types/types.js";
import { PodsRow } from "../types/db.js";

export default function map(row: PodsRow): PodInfo {
  return {
    claims: { iss: row.iss, sub: row.sub },
    id: row.id,
    name: row.name,
    hostname: row.hostname,
    hostnameAlias: row.hostname_alias,
    createdAt: row.created_at,
    tier: row.tier,
    description: row.description,
  };
}
