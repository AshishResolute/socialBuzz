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
      [post_id, user_id, userComment],
    );
    if (comment.rowCount === 0)
      return next(new AppError(`Comment not posted,Try Again Later!`, 500));
    res.status(201).json({
      message: `success`,
      commented_at: comment.rows[0].commented_on,
      commentId: comment.rows[0].id,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
});

router.delete(
  "/deleteComment/:postId/:commentId",
  verifyToken,
  async (req, res, next) => {
    try {
      let user_id = req.user.id;
      let post_id = parseInt(req.params.postId);
      let comment_id = parseInt(req.params.commentId);
      if (isNaN(post_id) || isNaN(comment_id))
        return next(
          new AppError(`Invalid post_id or comment_id recieved`, 400),
        );
      let findCommentOnPost = await db.query(
        `select id from comments where post_id=$1 and id=$2 and user_id=$3`,
        [post_id, comment_id, user_id],
      );
      if (findCommentOnPost.rowCount === 0)
        return next(new AppError(`Comment not Found or Post deleted!`, 404));
      let deleteComment = await db.query(`delete from comments where id=$1`, [
        comment_id,
      ]);
      if (deleteComment.rowCount === 0)
        return next(new AppError(`Comment not deleted,Try Again`, 500));
      res.status(200).json({
        message: `success,comment deleted`,
      });
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  },
);

let userCommentValidation = joi.object({
  userComment: joi.string().trim().min(1).max(500).required().messages({
    "string.empty": `Comment can't be empty`,
    "string.max": `Comment too long(500) characters allowed `,
  }),
});

router.patch(
  "/updateComment/:postId/:commentId",
  verifyToken,
  async (req, res, next) => {
    try {
      let user_id = req.user.id;
      let post_id = parseInt(req.params.postId);
      let comment_id = parseInt(req.params.commentId);
      let { error, value } = userCommentValidation.validate(req.body);
      if (error) {
        error.details.map((err) => console.log(err.message));
        next(new AppError(`Comment not valid, Try again!`, 400));
      }
      let { userComment } = value;
      if (isNaN(post_id) || isNaN(comment_id))
        return next(
          new AppError(`Invalid post_id or comment_id recieved!`, 400),
        );
      let findPost = await db.query(
        `select id from comments where post_id=$1 and id=$2`,
        [post_id, comment_id],
      );
      if (findPost.rowCount === 0)
        return next(new AppError(`Post or comment not found!`, 403));
      let updateComment = await db.query(
        `update  comments set content=$1,updated_at=$2 where post_id=$3 and id=$4 and user_id=$5`,
        [userComment,new Date().toISOString(), post_id, comment_id, user_id],
      );
      if (updateComment.rowCount === 0)
        return next(AppError(`comment not updated,try again!`, 500));
      res.status(200).json({
        message: `update successfull`,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  },
);
export default router;
