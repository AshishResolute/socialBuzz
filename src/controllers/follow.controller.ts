import type { Request, Response, NextFunction } from "express";
import {
  AppError,
  CheckIfDatabaseError,
  ClientError,
} from "../ErrorHandler/ErrorClass.js";
import type { UserIdInterface } from "../interfaces/interfaces.js";
import db from "../database/connection.js";

export const followUser = async (
  req: Request<UserIdInterface>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
    const userId = req.user?.id;
    if (!req.user?.id) {
      next(new ClientError(`Unauthorised`, 400, `Login before to continue`));
      return;
    } else if (!req.params.userId) {
      next(
        new ClientError(
          `Invalid Request`,
          400,
          `userId of following user is required!`,
        ),
      );
      return;
    }
    const followingUserId = parseInt(req.params.userId, 10);
  try {
    if (isNaN(followingUserId)) {
      next(
        new ClientError(`Invalid Request`, 400, `Invalid userId's provided`),
      );
    }
    const removeFollowRequest = await db.query(
      `delete from follow where follower_id=$1 and following_id=$2`,
      [userId, followingUserId],
    );
    if (removeFollowRequest.rowCount) {
      res.status(200).json({
        success: true,
        message: `Follow Request cancelled,you are not following now!`,
        unfollowed_at: new Date().toISOString(),
      });
      return;
    }
    const followUser = await db.query(
      `insert into follow values ($1,$2) returning *`,
      [userId, followingUserId],
    );
    if (followUser.rowCount) {
      res.status(200).json({
        success: true,
        message: `You are currently following user with id:${followingUserId}`,
        followed_at: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database Error:${error.message}`);
      if(error.code==='23505'){
        res.status(200).json({
            message:`You are already following user with id ${userId}`
        })
      }
      next(new AppError(error.message, 500));
      return;
    } else if (error instanceof Error) {
      console.error(`Standard App Error:${error.message}`);
      next(new AppError(error.message, 500));
      return;
    }
    next(error);
  }
};
