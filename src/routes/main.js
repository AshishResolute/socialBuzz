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

app.get("/health", generalLimitter, (req, res) => {
  res.status(200).json({ message: `Services Running Well,All Good!` });
});

app.use("/auth", auth);
app.use("/post", posts);
app.use("/like", likes);
app.use("/comment", comments);
app.use("/follow",follow);


app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(specs))
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const ErrorDetails = {
    message: err.message || `Internal Server Error`,
    TimeStamp: new Date().toISOString(),
  };
  res.status(status).json(ErrorDetails);
});

export default app;
