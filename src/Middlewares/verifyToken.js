import { AppError } from "../ErrorHandler/ErrorClass.js";
import jwt from "jsonwebtoken";


let verifyToken = (req, res, next) => {
  // console.log("All Headers:", req.headers);
// console.log("Auth Header:", req.headers.authorization);
  let auth = req.get("authorization");
  if (!auth) return next(new AppError(`Token not Received`, 401));
  let token = auth.split(" ")[1];
  jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
    if (err) return next(new AppError(`Token not verified`, 401));
    req.user = decode;
    next();
  });
};

export default verifyToken;
