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
  checkUserPostIdInterface,
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

export const updateUserPostContent = async (
  req: AuthenticatedRequest<checkUserPostIdInterface,{},checkUserContentInterface,{}>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let user_id = req.user.id;
    let post_id = req.params.postId;
    let findUser = await db.query(
      `select u.username as username,p.id as post_id from users as u join posts as p on u.id = p.user_id where p.user_id=$1 and p.id=$2`,
      [user_id, post_id],
    );
    if (findUser.rowCount === 0)
      return next(new ClientError(`User not Found!`, 404, `No post found!`));
    let { content } = req.body;
    let updatePostContent = await db.query(
      `update posts set content=$1,updated_at=$2 where id=$3 and user_id=$4 returning updated_at`,
      [content, new Date().toISOString(), post_id, user_id],
    );
    // await postQueue.add("postQueue", {
    //   to: process.env.RESEND_USER_ACCOUNT_NAME,
    //   message: `Post successfully updated!`,
    // });
    res.status(200).json({
      message: `post updated successfuly for ${findUser.rows[0].username}`,
      updated_at: updatePostContent.rows[0].updated_at,
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`DataBase error:${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
        details: error.detail || error.cause,
        timeStamp: new Date().toISOString(),
      });
      return;
    }
    if (error instanceof Error) {
      console.error(`Standard App Error:${error.message}`);
      next(new AppError(error.message, 500));
      return;
    }
    next(error);
  }
};
