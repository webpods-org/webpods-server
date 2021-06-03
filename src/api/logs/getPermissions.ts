import { IRouterContext } from "koa-router";
import handleResult from "../handleResult";
import getPermissions from "../../domain/log/getPermissions";
import { Permission } from "../../types/types";

export type GetPermissionsAPIResult = {
  permissions: Permission[];
};

export default async function addPermissionAPI(ctx: IRouterContext) {
  const hostname = ctx.URL.hostname;

  await handleResult(
    ctx,
    () =>
      getPermissions(
        ctx.state.jwt.claims.iss,
        ctx.state.jwt.claims.sub,
        hostname,
        ctx.params.log
      ),
    (result) => {
      const body: GetPermissionsAPIResult = {
        permissions: result.permissions,
      };
      ctx.body = body;
    }
  );
}
