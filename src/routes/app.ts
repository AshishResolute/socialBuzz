import express from "express";
import morgan from "morgan";
import auth from "./auth.js";
import posts from "./posts.js";
import likes from "./likes.js";
import comments from "./comments.js";
import follow from "./follow.js";
import specs from "../config/swagger.js";
import swaggerUi from "swagger-ui-express";
import feed from "./feed.js";
import users from "./users.js";
import type { NextFunction, Request, Response } from "express";
import { GlobalErrorHandler } from "../Middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
// import  expressStatusMonitor  from 'express-status-monitor'
const app = express();

const allowedOrigins = ['https://social-buzz-frontend-sand.vercel.app/']

if(process.env.NODE_ENV!=='production'){
  console.log(`Running on dev mode`) // accept req from localhost(frontend)
  allowedOrigins.push('http://localhost:5173')
}


app.use(cors({
  origin:allowedOrigins,
  credentials:true
}))




// app.use(expressStatusMonitor());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/**
 * @openapi
 * /health:
 *  get:
 *    description: Responds if the app is up and running
 *    responses:
 *      '200':
 *        description: App is Working
 */

app.get("/health", (_req: Request, res: Response, _next: NextFunction) => {
  res
    .status(200)
    .json({
      success: true,
      message: `Services Running Well,All Good!`,
      timeStamp: new Date().toISOString(),
    });
});

app.use("/auth", auth);
app.use("/post", posts);
app.use("/like", likes);
app.use("/comment", comments);
app.use("/follow", follow);
app.use("/feed", feed);
app.use("/", users);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(GlobalErrorHandler);

export default app;
