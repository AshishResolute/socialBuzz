
import type { Request, Response, NextFunction } from "express";
import { AppError, ClientError } from "../ErrorHandler/ErrorClass.ts";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_KEY } from "../config.ts";
import type { UserJWTPayload } from "../interfaces/interfaces.ts";

const verifyToken = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const auth = req.headers["authorization"];
    if (!auth)
    {
      return next(
        new ClientError(
          `Bad Request`,
          401,
          `Not Authorised,login before to continue!`,
        ),
      );
      
    }
      
    const token = auth.split(" ")[1];
    if (!token || token.trim() === "")
      return next(new ClientError(`Bad Request`, 401, `jwt must be provided!`));
    // when i use the callback function to get the payload no need to assign it to a variable as the function returns void
    // jwt.verify(token, JWT_ACCESS_KEY, (err, decode) => {
    //   if (err instanceof jwt.JsonWebTokenError)
    //     return next(new ClientError(`Bad Request`, 401, err.message));
    //   req.user = decode;
    //   next();
    // });
    // synchronous handling
    const decodedPayload = jwt.verify(token, JWT_ACCESS_KEY!) as UserJWTPayload;
    req.user = decodedPayload;
    next();
  } catch (err) {
    if (err instanceof Error) {
      return next(new ClientError(`Bad request`, 401, err.message));
    }
    console.error(`Non-standard Error,${err}`);
    return next(
      new ClientError(`Bad Request`, 401, `Unexpected Authentication Error`),
    );
  }
};

export default verifyToken;
