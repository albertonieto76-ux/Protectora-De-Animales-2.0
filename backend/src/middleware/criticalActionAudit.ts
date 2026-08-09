import type { Request, Response, NextFunction } from "express";
import { auditFromRequest } from "../services/securityAudit.service.js";

export const auditCriticalAction = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      auditFromRequest(req, {
        action,
        success,
        reason: success ? undefined : `HTTP ${res.statusCode}`,
        metadata: {
          statusCode: res.statusCode,
        },
      }).catch(() => undefined);
    });

    next();
  };
};
