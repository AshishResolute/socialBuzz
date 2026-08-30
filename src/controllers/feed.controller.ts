import type { Request, Response, NextFunction } from "express";
import db from "../database/connection.js";
import { CheckIfDatabaseError } from "../ErrorHandler/ErrorClass.js";
import { AppError } from "../ErrorHandler/ErrorClass.js";
import type { Pagination } from "../interfaces/interfaces.js";

export const userFeed = async (
  req: Request<{}, {}, {}, Pagination>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    let { page, limit } = req.query;
    if (!page) {
      page = req.query.page || 1;
    }
    if (!limit) {
      limit = req.query.limit || 1;
    }
    console.log(page,limit)
    // implementing offset based pagination
    const offset = (page - 1) * limit;
    const userFeed = await db.query(
      `select p.content from posts as p join follow as f on p.user_id=f.following_id where f.follower_id=$1 limit $2 offset $3`,
      [userId, limit, offset],
    );
    if (!userFeed.rowCount) {
      res.status(200).json({
        success: true,
        message: `Nothing To show here,Try following someone!`,
        fetched_at: new Date().toISOString(),
      });
    }
    const userFeedPosts = userFeed.rows.map((post) => post);
    res.status(200).json({
      success: true,
      message: `Your Feed is:`,
      userFeedPosts,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database Error:${error.message}`);
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
