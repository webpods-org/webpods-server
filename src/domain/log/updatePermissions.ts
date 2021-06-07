import * as config from "../../config";
import * as db from "../../db";
import { join } from "path";
import random from "../../utils/random";
import { Permission } from "../../types/types";
import { Result } from "../../types/api";
import ensurePod from "./ensurePod";
import { ACCESS_DENIED } from "../../errors/codes";

export type UpdatePermissionsResult = {
  added: number;
  removed: number;
};

export type LogEntry = {
  data: string;
  encoding?: "utf-8";
  previousCommit?: string;
};

export default async function updatePermissions(
  iss: string,
  sub: string,
  hostname: string,
  log: string,
  {
    add,
    remove,
  }: { add: Permission[]; remove: { claims: { iss: string; sub: string } }[] }
): Promise<Result<UpdatePermissionsResult>> {
  const appConfig = config.get();

  return ensurePod(hostname, async (pod) => {
    // Let's see if the log already exists.
    const podDataDir = join(appConfig.storage.dataDir, pod.dataDir);
    const podDb = db.getPodDb(podDataDir);

    if (pod.claims.iss === iss && pod.claims.sub === sub) {
      if (add) {
        for (const permission of add) {
          // See if the permission already exists.
          const existingPermStmt = podDb.prepare(
            `SELECT * FROM "permissions" WHERE "log"=@log AND "iss"=@iss AND "sub"=@sub`
          );

          const existingItem = existingPermStmt.get({
            log,
            iss: permission.claims.iss,
            sub: permission.claims.sub,
          });

          // Don't insert if it already exists.
          if (!existingItem) {
            const insertPermStmt = podDb.prepare(
              `INSERT INTO "permissions" ("log", "iss", "sub", "read", "write", "admin", "metadata", "created_at") VALUES (@log, @iss, @sub, @read, @write, @admin, @metadata, @created_at)`
            );

            insertPermStmt.run({
              log,
              iss: permission.claims.iss,
              sub: permission.claims.sub,
              read: permission.access.read ? 1 : 0,
              write: permission.access.write ? 1 : 0,
              admin: permission.access.admin ? 1 : 0,
              metadata: permission.access.metadata ? 1 : 0,
              created_at: Date.now(),
            });
          }
        }
      }

      if (remove) {
        for (const item of remove) {
          // See if the permission already exists.
          const deletePermStmt = podDb.prepare(
            `DELETE FROM "permissions" WHERE "log"=@log AND "iss"=@iss AND "sub"=@sub`
          );

          const existingItem = deletePermStmt.get({
            log,
            iss: item.claims.iss,
            sub: item.claims.sub,
          });
        }
      }

      return {
        ok: true,
        added: add ? add.length : 0,
        removed: remove ? remove.length : 0,
      };
    } else {
      return {
        ok: false,
        code: ACCESS_DENIED,
        error: "Access denied.",
      };
    }
  });
}