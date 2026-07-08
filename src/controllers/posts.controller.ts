import type { Response, NextFunction } from "express";
import db from "../database/connection.js";
import {
  AppError,
  CheckIfDatabaseError,
  ClientError,
} from "../ErrorHandler/ErrorClass.js";
import type {
  AuthenticatedRequest,
  checkUserContentInterface,
} from "../interfaces/interfaces.ts";

export const createUserPost = async (
  req: AuthenticatedRequest<{}, {}, checkUserContentInterface, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = req.user;
    let { content } = req.body;
    const findUser = await db.query(`select username from users where id=$1`, [
      user_id,
    ]);
    if (findUser.rowCount === 0)
      return next(
        new ClientError(
          `User not found`,
          404,
          `User account not found or deleted!`,
        ),
      );
    const postAContent = await db.query(
      `insert into posts(content,user_id) values($1,$2) returning user_id,created_at,updated_at ,id`,
      [content, user_id],
    );
    if (postAContent.rowCount === 0)
      return next(new AppError(`Failed To make a Post`, 500));
    //   await postQueue.add("postQueue", {
    //     to: process.env.RESEND_USER_ACCOUNT_NAME,
    //     message: `New post successfully created!`,
    //   });
    res.status(201).json({
      success: true,
      message: `post made by ${findUser.rows[0].username}`,
      postId: postAContent.rows[0].id,
      postedAt: postAContent.rows[0].created_at,
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database error ,${(error.message, error.detail)}`);
      return next(new AppError(error.message, 500));
    } else if (error instanceof Error) {
      console.error(`Standard App error: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  }
};
