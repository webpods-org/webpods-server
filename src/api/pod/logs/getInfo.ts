import handleResult from "../../handleResult.js";
import getInfo from "../../../domain/log/getInfo.js";
import { IKoaAppContext } from "../../../types/koa.js";

export type GetInfoAPIResult = {
  id: number;
  commit: string;
};

export default async function getEntriesAPI(
  ctx: IKoaAppContext
): Promise<void> {
  const hostname = ctx.URL.hostname;

  await handleResult(
    ctx,
    () => getInfo(hostname, ctx.params.log, ctx.state.jwt?.claims),
    (result) => {
      const body: GetInfoAPIResult = {
        id: result.value.id,
        commit: result.value.commit,
      };
      ctx.body = body;
    }
  );
}