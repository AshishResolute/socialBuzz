import express from "express";
import morgan from "morgan";
import auth from "./auth.js";
import posts from "./posts.js";
import likes from "./likes.js";
import comments from "./comments.js";
import { generalLimitter } from "../rateLimitter/rate-limitter.js";
import follow from './follow.js';
import specs from '../config/swagger.js'
import swaggerUi from 'swagger-ui-express';
import feed from './feed.js'
import users from './users.js'
import type { NextFunction, Request,Response } from "express";
import { GlobalErrorHandler } from "../Middlewares/globalErrorHandler.ts";
import { AppError } from "../ErrorHandler/ErrorClass.js";
const app = express();

app.use(express.json());
app.use(morgan("dev"));

/**
 * @openapi
 * /health:
 *  get:
 *    description: Responds if the app is up and running
 *    responses:
 *      '200':
 *        description: App is healthy
 */

app.get("/health", generalLimitter, (req:Request, res:Response,next:NextFunction) => {
  res.status(200).json({ success:true,message: `Services Running Well,All Good!`,timeStamp:new Date().toISOString() });
});

app.use("/auth", auth);
app.use("/post", posts);
app.use("/like", likes);
app.use("/comment", comments);
app.use("/follow",follow)
app.use("/feed",feed);
app.use("/",users);

app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(specs))
app.use(GlobalErrorHandler)

export default app;
