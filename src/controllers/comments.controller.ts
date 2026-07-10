import type { Request, Response, NextFunction } from "express";
import type {
  validateUserCommentInterface,
  checkUserPostIdInterface,
} from "../interfaces/interfaces.ts";
import db from "../database/connection.js";
import {
  AppError,
  CheckIfDatabaseError,
  ClientError,
} from "../ErrorHandler/ErrorClass.ts";
export const createUserCommentOnPost = async (
  req: Request<checkUserPostIdInterface, {}, validateUserCommentInterface, {}>,
  res: Response,
  next: NextFunction,
):Promise<void> => {
  try {
    let user_id = req.user?.id;
    let post_id = req.params?.postId;
    let { userComment } = req.body;
    let findPost = await db.query(`select id from posts where id=$1`, [
      post_id,
    ]);
    if (findPost.rowCount === 0)
      return next(
        new ClientError(
          `Post not Found!`,
          404,
          `Post not found,try again later`,
        ),
      );
    let comment = await db.query(
      `insert into comments(post_id,user_id,content) values($1,$2,$3) returning id,commented_on,content`,
      [post_id, user_id, userComment],
    );
    res.status(201).json({
      success: true,
      userComment: comment.rows[0].content,
      commented_at: comment.rows[0].commented_on,
      commentId: comment.rows[0].id,
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database Error:${error.message}`);
      next(new AppError(error.message, 500));
      return;
    } else if (error instanceof Error) {
      console.error(`Standard App Error`);
      next(new AppError(error.message, 500));
      return;
    }
    next(error);
  }
};
