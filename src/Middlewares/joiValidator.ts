import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import { AppError } from "../ErrorHandler/ErrorClass.js";

interface validationInterface {
  params?: ObjectSchema;
  body?: ObjectSchema;
  query?: ObjectSchema;
}

export const validate = (schema: validationInterface) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    console.log(schema.body)
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body);
      if (error) return next(new AppError(error.message, 400));
      req.body = value;
    }
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query);
      if (error) return next(new AppError(error.message, 400));
      req.query = value;
    }
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params);
      if (error) return next(new AppError(error.message, 400));
      req.params = value;
    }
    next();
  };
};
