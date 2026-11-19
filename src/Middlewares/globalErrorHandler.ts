import type { Request, Response, NextFunction } from "express";
import {
  AppError,
  ClientError,
  DataBaseErrors,
} from "../ErrorHandler/ErrorClass.js";
import { DatabaseError } from "pg";

interface ErrorMessage {
  success: boolean;
  statusCode: number;
  message: string;
}

export const GlobalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const ErrorDetails: ErrorMessage = {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    };
    res.status(err.statusCode).json(ErrorDetails);
    return;
  } else if (err instanceof ClientError) {
    const ErrorDetails: ErrorMessage & { name: string; details: string } = {
      success: false,
      name: err.name,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
    };
    res.status(err.statusCode).json(ErrorDetails);
    return;
  } else if (err instanceof DataBaseErrors) {
    const ErrorDetails: ErrorMessage & { code: string; detail?: string } = {
      success: false,
      message: err.message,
      code: err.code??'500',
      statusCode: err.statusCode,
      detail: err.detail ?? err.message,
    };
    res.status(err.statusCode).json(ErrorDetails);
    return;
  }
  else if(err instanceof DatabaseError){
    if(err.code==='23503')
    res.status(404).json({
      success:false,
      message:`Post not found`
    })
    return 
  }
  res.status(500).json({
    success: false,
    message: `Internal Server Error,Reason:${err.message}`,
  });
};
