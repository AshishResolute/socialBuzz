import type { UserJWTPayload } from "../interfaces/interfaces.ts";

declare global {
  namespace Express {
    interface Request {
      user?:UserJWTPayload;
    }
  }
}
