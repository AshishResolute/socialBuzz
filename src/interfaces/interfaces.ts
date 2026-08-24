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
  postId?:string
}

export interface validateUserCommentInterface{
  userComment:string
}

export interface UserPostAndCommentIdInterface{
  postId?:string;
  commentId?:string;
}

export interface UserIdInterface{
  userId?:string
}

export interface UserProfileUpdate{
  display_name?:string,
  location?:string,
  socials?:string[],
  bio?:string,
}

export type inputFieldsValuesTypes = string|string[]|number

export interface forgotPasswordInterface{
  email:string
}

export interface passwordResetTokenInterface{
  resetPasswordToken:string
}

export interface userPasswordInterface{
  newPassword:string
  confirmPassword:string
}

export interface User{
  id:number;
  email:string;
  password:string;
  username:string;
  display_name:string;
  bio:string|null;
  socials:string[];
  location:string|null;
  profile_picture:string|null;
  reset_password_token:string|null;
  reset_token_expiry:Date|null;
  created_at:Date;
  updated_at:Date;
}

export interface Pagination{
  page?:number;
  limit?:number;
}