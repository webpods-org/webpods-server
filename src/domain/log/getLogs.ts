import * as config from "../../config";
import * as db from "../../db";
import mapper from "../../mappers/log";
import { DomainResult as DomainResult } from "../../types/api";
import { MISSING_POD } from "../../errors/codes";
import { join } from "path";
import random from "../../utils/random";
import mkdirp = require("mkdirp");
import { getPodByHostname } from "../pod/getPodByHostname";
import { LogInfo } from "../../types/types";
import { LogsRow } from "../../types/db";

export type GetLogsResult = {
  logs: {
    log: string;
  }[];
};

export default async function getLogs(
  issuer: string,
  username: string,
  hostname: string,
  tags: string | undefined
): Promise<DomainResult<GetLogsResult>> {
  const appConfig = config.get();
  const sqlite = db.get();
  const pod = await getPodByHostname(issuer, username, hostname);

  if (pod) {
    const getLogsStmt = sqlite.prepare("SELECT * FROM logs WHERE pod=@pod");

    const tagsList = tags ? tags.split(",") : [];

    const logs = getLogsStmt
      .all({ pod: pod.pod })
      .map((x: LogsRow) => ({
        log: x.log,
        tags: x.tags,
      }))
      .filter((x) => {
        if (!tags) {
          return true;
        } else {
          const logTags = x.tags?.split(",");
          return logTags && tagsList.every((tag) => logTags.includes(tag));
        }
      });

    return {
      success: true,
      logs,
    };
  } else {
    return {
      success: false,
      code: MISSING_POD,
      error: "Pod not found.",
    };
  }
}

function generateLogId() {
  return random(8);
}
