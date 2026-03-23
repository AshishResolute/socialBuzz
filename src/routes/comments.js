import express from "express";
import verifyToken from "../middlewears/verifyToken.js";
import { AppError } from "../../ErrorHandler/ErrorClass.js";
import db from "../../database/connection.js";
import joi from "joi";

const router = express.Router();

const validateUserComment = joi.object({
  userComment: joi.string().trim().min(1).max(500).required().messages({
    "string.empty": `Comment cannot be empty`,
    "string.max": `Comment too long(max 500 characters allowed)`,
  }),
});

router.post("/postComment/:postId", verifyToken, async (req, res, next) => {
  try {
    let user_id = req.user.id;
    let post_id = parseInt(req.params.postId);
    let { error, value } = validateUserComment.validate(req.body);
    if (error)
      return next(new AppError(`Comment Invalid or Limit exceeds`, 400));
    let { userComment } = value;
    if (isNaN(post_id) || post_id <= 0)
      return next(new AppError(`Invalid post_id recieved`, 400));
    let findPost = await db.query(`select id from posts where id=$1`, [
      post_id,
    ]);
    if (findPost.rowCount === 0)
      return next(new AppError(`Post not Found!`, 404));
    let comment = await db.query(
      `insert into comments(post_id,user_id,content) values($1,$2,$3) returning id,commented_on`,
      [post_id, user_id,userComment],
    );
    if (comment.rowCount === 0)
      return next(new AppError(`Comment not posted,Try Again Later!`, 500));
    res.status(200).json({
      message: `success`,
      commented_at: comment.rows[0].commented_on,
      commentId: comment.rows[0].id,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
});

export default router;
