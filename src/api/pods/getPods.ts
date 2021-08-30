import { IRouterContext } from "koa-router";
import * as config from "../../config/index.js";
import { NOT_FOUND } from "../../errors/codes.js";
import { getPods } from "../../domain/pod/getPods.js";
import handleResult from "../handleResult.js";

export type GetPodsAPIResult = {
  pods: {
    hostname: string;
    hostnameAlias: string | null;
    name: string;
    description: string;
  }[];
};

export default async function getPodsAPI(ctx: IRouterContext): Promise<void> {
  const appConfig = config.get();
  const hostname = ctx.URL.hostname;

  if (hostname === appConfig.hostname) {
    await handleResult(
      ctx,
      () => getPods(ctx.state.jwt?.claims.iss, ctx.state.jwt?.claims.sub),
      (result) => {
        const body: GetPodsAPIResult = {
          pods: result.value.pods.map((x) => ({
            hostname: x.hostname,
            hostnameAlias: x.hostnameAlias,
            name: x.name,
            description: x.description,
          })),
        };
        ctx.body = body;
      }
    );
  } else {
    ctx.status = 404;
    ctx.body = {
      error: "Not found.",
      code: NOT_FOUND,
    };
  }
}
