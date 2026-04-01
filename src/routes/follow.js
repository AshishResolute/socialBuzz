import express from "express";
import verifyToken from "../middlewears/verifyToken.js";
import { AppError } from "../../ErrorHandler/ErrorClass.js";
import db from "../../database/connection.js";

const router = express.Router();

router.post("/:userId", verifyToken, async (req, res, next) => {
  try {
    let user_id = req.user.id;
    let followUserId = parseInt(req.params.userId);
    if (isNaN(followUserId))
      return next(new AppError(`Invalid followerId recieved`, 400));
    if (user_id === followUserId)
      return next(new AppError(`You cannot follow Yourself!`, 400));
    let findUser = await db.query(`select userName from users where id=$1`, [
      followUserId,
    ]);
    if (findUser.rowCount === 0)
      return next(new AppError(`User not Found!`, 404));
    let followUser = await db.query(`insert into follow values($1,$2)`, [
      user_id,
      followUserId,
    ]);
    if (followUser.rowCount === 0)
      return next(
        new AppError(`something went wrong!,couldn't follow user`, 500),
      );
    res.status(201).json({
      message: `You are currently following!, ${findUser.rows[0].username}`,
      timeStamp: `Followed at ${new Date().toLocaleString()}`,
    });
  } catch (err) {
    if (err.code === "23505")
      return next(new AppError(`You are already follwing!`, 400));
    console.log(err.message);
    next(err);
  }
});

router.delete("/unfollow/:followingId", verifyToken, async (req, res, next) => {
  try {
    let user_id = req.user.id;
    let following_id = parseInt(req.params.followingId);
    if (isNaN(following_id))
      return next(new AppError(`Invalid followingId recieved`, 400));
    let checkIfFollowing = await db.query(
      `select u.username as username from users as u join follow as f on u.id = f.following_id where f.follower_id=$1 and following_id=$2`,
      [user_id, following_id],
    );
    if (checkIfFollowing.rowCount === 0)
      return next(new AppError(`You currently Dont follow the user!`, 400));
    let unfollowUser = await db.query(
      `delete from follow where follower_id=$1 and following_id=$2`,
      [user_id, following_id],
    );
    if (unfollowUser.rowCount === 0)
      return next(new AppError(`something went wrong,try again later`, 500));
    res.status(200).json({
      message: `You unfollowed!,${checkIfFollowing.rows[0].username}`,
      timeStamp: new Date().toLocaleString(),
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
});

export default router;
