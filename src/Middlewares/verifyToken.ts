// import { AppError } from "../ErrorHandler/ErrorClass.js";
// import jwt from "jsonwebtoken";

// let verifyToken = (req, res, next) => {
//   // console.log("All Headers:", req.headers);
// // console.log("Auth Header:", req.headers.authorization);
//   let auth = req.get("authorization");
//   if (!auth) return next(new AppError(`Token not Received`, 401));
//   let token = auth.split(" ")[1];
//   jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
//     if (err) return next(new AppError(err.message, 401));
//     req.user = decode;
//     next();
//   });
// };

// export default verifyToken;

import type { Request, Response, NextFunction } from "express";
import { ClientError } from "../ErrorHandler/ErrorClass.ts";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_KEY } from "../config.ts";
export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.headers["authorization"];
    if (!auth)
      return next(
        new ClientError(
          `Bad Request`,
          401,
          `Not Authorised,login before to continue!`,
        ),
      );
    const token = auth.split(" ")[1];
    if(!token||token.trim()==='') return next(new ClientError(`Bad Request`,401,`jwt must be provided!`))
    // when i use the callback function to get the payload no need to assign it to a variable as the function returns void
    // jwt.verify(token, JWT_ACCESS_KEY, (err, decode) => {
    //   if (err instanceof jwt.JsonWebTokenError)
    //     return next(new ClientError(`Bad Request`, 401, err.message));
    //   req.user = decode;
    //   next();
    // });
    const decodedPayload = jwt.verify(token,JWT_ACCESS_KEY!);
    req.user= decodedPayload
    next()
  } catch (err) {
    if(err instanceof Error){
        return next(new ClientError(`Bad request`,401,err.message))
    }
    console.error(`Non-standard Error,${err}`)
    return next(new ClientError(`Bad Request`,401,`Unexpected Authentication Error`))
  }
};
