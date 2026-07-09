import { type JwtPayload } from "jsonwebtoken";
import type { Request } from "express";

export interface SignUpInterface {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
}

export interface LoginInterface {
  email: string;
  password: string;
}

export interface UserJWTPayload extends JwtPayload {
  id: number;
}

export interface DatabaseError extends Error {
  code: string;
  table?: string;
  constraint?: string;
  detail?: string;
}

export interface userNameInterface {
  username?: string;
}

export interface checkUserContentInterface {
  content: string;
}

export interface AuthenticatedRequest<
  Params = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user: UserJWTPayload;
}


export interface checkUserPostIdInterface{
  postId:number
}