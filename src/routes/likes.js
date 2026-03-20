import express, { application } from "express";
import { AppError } from "../../ErrorHandler/ErrorClass.js";
import db from "../../database/connection.js";
import verifyToken from "../middlewears/verifyToken.js";

const router = express.Router();

router.post("/likePost/:PostId", verifyToken, async (req, res, next) => {
  try {
    let user_id = req.user.id;
    let post_id = parseInt(req.params.PostId);
    if (isNaN(post_id)) return next(new AppError(`Invalid Post_id`, 400));
    let findPost = await db.query(`select id from posts where id=$1`, [
      post_id,
    ]);
    if (findPost.rowCount === 0)
      return next(new AppError(`Post not found`, 404));
    let likeAPost = await db.query(
      `insert into likes(post_id,user_id) values($1,$2) returning id,liked_at`,
      [post_id, user_id],
    );
    if (likeAPost.rowCount === 0)
      return next(new AppError(`Post already Liked!`, 400));
    res
      .status(200)
      .json({
        message: `You successfully liked the post with Id${post_id}`,
        likeId: likeAPost.rows[0].id,
        Liked_at: likeAPost.rows[0].liked_at,
      });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router
