import db from "../database/connection.js";
import {
  AppError,
  CheckIfDatabaseError,
  ClientError,
} from "../ErrorHandler/ErrorClass.js";
import type { Request, Response, NextFunction } from "express";
import redisConnection from "../database/redis.js";
import type {
  userNameInterface,
  UserProfileUpdate,
} from "../interfaces/interfaces.ts";

export const userInfo = async (
  req: Request<userNameInterface>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const username = req.params.username as string;
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

export const updateUserProfileDetails = async (
  req: Request<{}, {}, UserProfileUpdate>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const allowedFields = new Set<string>([
    "display_name",
    "location",
    "socials",
    "bio",
  ]);
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      next(
        new ClientError(
          `Unauthorised request`,
          400,
          `Login before to continue!`,
        ),
      );
    }
    let baseQuery = `update users set `;
    let inputFields: string[] = [];
    let inputFieldsValues = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields.has(key)) {
        inputFields.push(key);
        inputFieldsValues.push(value);
      } else {
        next(
          new ClientError(
            `Invalid update details provided`,
            400,
            `These fields are not valid!`,
          ),
        );
        return;
      }
    }
      let dynamicQuery: string = "";
      inputFields.forEach((data, index) => {
        dynamicQuery += `${data} = $${index + 1}`;
        if (index+1 !== inputFields.length) dynamicQuery += ", ";
      });
      baseQuery +=
        dynamicQuery + ` where id = $${inputFields.length + 1} returning *`;
      inputFieldsValues.push(user_id);
      const updateUserProfile = await db.query(baseQuery, inputFieldsValues); 
      const {id,email,password,username,created_at,...updatedData} = updateUserProfile.rows[0]
      res.status(200).json({
        success: true,
        message: `User Profile updated!`,
        updated_details:updatedData,
        updated_at: new Date().toISOString(),
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
