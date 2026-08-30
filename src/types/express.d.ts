import type { UserJWTPayload } from "../interfaces/interfaces.ts";

declare global {
  namespace Express {
    interface Request {
      user?:UserJWTPayload;
      validatedQuery?:{
        page?:number;
        limit?:number;
        userQuery?:string;
      }
    }
  }
}

declare module 'express-status-monitor';
