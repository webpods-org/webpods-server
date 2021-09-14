import * as db from "../../db/index.js";
import { JwtClaims } from "../../types/types.js";
import { Result } from "../../types/api.js";
import ensurePod from "../pods/util/ensurePod.js";
import { INVALID_JWT, INVALID_OR_EXPIRED_TOKEN } from "../../errors/codes.js";
import { PermissionTokensRow } from "../../types/db.js";
import { generateUpdateStatement } from "../../lib/sqlite.js";
import { getPodDataDir } from "../../storage/index.js";
import permissionTokenMapper from "../../mappers/permissionToken.js";
import addLogPermission from "../permissions/util/addLogPermission.js";

export type RedeemPermissionTokenResult = {};

export default async function redeemPermissionToken(
  hostname: string,
  token: string,
  userClaims: JwtClaims
): Promise<Result<RedeemPermissionTokenResult>> {
  if (userClaims.sub !== "*") {
    return ensurePod(hostname, async (pod) => {
      // Explicity check if sub === *, since that has special meaning in permissions.
      // We do not allow sub = *

      // Let's see if the log already exists.
      const podDataDir = getPodDataDir(pod.id);
      const podDb = db.getPodDb(podDataDir);

      const getTokenStmt = podDb.prepare(
        `SELECT * FROM "permission_tokens" WHERE "id" = @id AND "expiry" > @expiry AND "max_redemptions" > "redemptions"`
      );

      const matchingTokens = getTokenStmt.get({
        id: token,
        expiry: Date.now(),
      });

      if (matchingTokens) {
        const token = permissionTokenMapper(matchingTokens);

        for (const logPermission of token.permissions.logs) {
          await addLogPermission(
            logPermission.log,
            {
              iss: userClaims.iss,
              sub: userClaims.sub,
            },
            logPermission.access,
            true,
            podDb
          );
        }

        const updateParams = { redemptions: token.redemptions + 1 };
        const updatePermStmt = podDb.prepare(
          generateUpdateStatement<PermissionTokensRow>(
            "permission_tokens",
            updateParams,
            `WHERE "id" > @id`
          )
        );

        updatePermStmt.run({ ...updateParams, id: token.id });

        return {
          ok: true,
          value: {},
        };
      } else {
        return {
          ok: false,
          error: "Token is invalid or expired.",
          code: INVALID_OR_EXPIRED_TOKEN,
        };
      }
    });
  } else {
    return {
      ok: false,
      error: "The sub claim is invalid.",
      code: INVALID_JWT,
    };
  }
}