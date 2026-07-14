import db from "../database/connection.js";
import { AppError, CheckIfDatabaseError } from "../ErrorHandler/ErrorClass.js";
import type { Request, Response, NextFunction } from "express";
import redisConnection from "../database/redis.js";
import type { userNameInterface } from "../interfaces/interfaces.ts";


let userInfo = async (req: Request<userNameInterface>, res: Response, next: NextFunction) => {
  try {
    const username = req.params.username as string
    // const {username} = req.params
    const cachedUserData = await redisConnection.get(username);
    if (cachedUserData)
      return res.status(200).json({
        success: true,
        message: `${username} profile Details`,
        joined_at: JSON.parse(cachedUserData).created_at,
        followers: JSON.parse(cachedUserData).followers_count,
        posts: JSON.parse(cachedUserData).posts,
      });
    let userInfo = await db.query(
      `select u.username as username,u.created_at as created_at,(select count(f.follower_id) from follow as f where f.following_id=u.id) as followers_count,COALESCE(ARRAY_AGG(p.content)) as posts from users as u left join posts as p on u.id=p.user_id where u.username=$1 group by u.username,u.created_at,u.id `,
      [username],
    );
    if (userInfo.rowCount === 0)
      return next(new AppError(`User not found`, 404));
    await redisConnection.set(
      username,
      JSON.stringify(userInfo.rows[0]),
      "EX",
      120,
    );

    res.status(200).json({
      success: true,
      details: userInfo.rows[0],
    });
  } catch (err) {
    if (CheckIfDatabaseError(err)) {
      console.error(`Database Error`);
      res.status(400).json({
        success: false,
        message: err.detail,
      });
    } else if (err instanceof Error) {
      console.error(`Standard Application Error:${err.message}`);
      res.status(500).json({ success: false, message: err.message });
    }
    console.error(`Unexpected Error:${err}`);
    next(err);
  }
};

export default userInfo;
