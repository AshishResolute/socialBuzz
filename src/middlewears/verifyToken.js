import { AppError } from "../../ErrorHandler/ErrorClass.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileName);

dotenv.config({ path: path.join(__dirname, "../../dev.env") });

let verifyToken = (req, res, next) => {
  let auth = req.get("Authorization");
  if (!auth) return next(new AppError(`Token not Recieved`, 404));
  let token = auth.split(" ")[1];
  jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
    if (err) return next(new AppError(`Token not verified`, 400));
    req.user = decode;
    next();
  });
};

export default verifyToken;
