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
    if(user_id===followUserId) return next(new AppError(`You cannot follow Yourself!`,400))
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

export default router;
