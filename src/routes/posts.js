import express from "express";
import verifyToken from "../middlewears/verifyToken.js";
import joi from "joi";
import db from "../../database/connection.js";
import { AppError } from "../../ErrorHandler/ErrorClass.js";
import { userPostLimitter } from "../rateLimitter/rate-limitter.js";
import { postQueue } from "../queues/emailQueue.js";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
const currentFile = fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFile);
dotenv.config({ path: path.join(__dirname, "../../dev.env") });

const router = express.Router();

let checkUserContent = joi.object({
  content: joi.string().trim().min(1).max(800).required().messages({
    "string.empty": `Post content cannot be empty`,
    "string.max": `Post maximum characters reached(800) characters allowed`,
  }),
});

router.post(
  "/content",
  userPostLimitter,
  verifyToken,
  async (req, res, next) => {
    try {
      let user_id = req.user.id;
      let { error, value } = checkUserContent.validate(req.body);
      if (error) {
        error.details.map((err) => console.log(err.message));
        return next(new AppError(`Enter valid Text Content`, 400));
      }
      let { content } = value;
      let findUser = await db.query(`select username from users where id=$1`, [
        user_id,
      ]);
      if (findUser.rowCount === 0)
        return next(new AppError(`User not found`, 404));
      let postAContent = await db.query(
        `insert into posts(content,user_id) values($1,$2) returning user_id,created_at,updated_at`,
        [content, user_id],
      );
      if (postAContent.rowCount === 0)
        return next(new AppError(`Failed To make a Post`, 500));
      await postQueue.add("postQueue", {
        to: process.env.RESEND_USER_ACCOUNT_NAME,
        message: `New post successfully created!`,
      });
      res.status(200).json({
        message: `post made by ${findUser.rows[0].username}`,
        postedAt: postAContent.rows[0].created_at,
      });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
);

const updatedPostContent = joi.object({
  content: joi.string().required(),
});

router.put(
  "/editPost/:postId",
  userPostLimitter,
  verifyToken,
  async (req, res, next) => {
    try {
      let user_id = req.user.id;
      let post_id = req.params.postId;
      console.log(post_id);
      let { error, value } = updatedPostContent.validate(req.body);
      if (error) {
        error.details.map((err) => console.log(err.message));
        return next(new AppError(`Enter valid text content`, 400));
      }
      let findUser = await db.query(
        `select u.username as username,p.id as post_id from users as u join posts as p on u.id = p.user_id where p.user_id=$1 and p.id=$2`,
        [user_id, post_id],
      );
      if (findUser.rowCount === 0)
        return next(new AppError(`User not Found!`, 404));
      let { content } = value;
      let updatePostContent = await db.query(
        `update posts set content=$1,updated_at=$2 where id=$3 and user_id=$4 returning updated_at`,
        [content, new Date().toISOString(), post_id, user_id],
      );
      if (updatePostContent.rowCount === 0)
        return next(new AppError(`Post not Updated,Try Again!`, 500));
      await postQueue.add("postQueue", {
        to: process.env.RESEND_USER_ACCOUNT_NAME,
        message: `Post successfully updated!`,
      });
      res.status(200).json({
        message: `post updated successfuly for ${findUser.rows[0].username}`,
        updated_at: updatePostContent.rows[0].updated_at,
      });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
);

router.delete("/delete/:postId", verifyToken, async (req, res, next) => {
  try {
    let user_id = req.user.id;
    let post_id = parseInt(req.params.postId);
    console.log(`post_id:${post_id}`)
    if (isNaN(post_id))
      return next(new AppError(`Invalid postId recieved`), 400);
    let findPost = await db.query(`select id from posts where id=$1`, [
      post_id,
    ]);
    if (findPost.rowCount===0) return next(new AppError(`Post not found`, 404));
    let deletePost = await db.query(
      `delete from posts where id=$1 and user_id=$2`,
      [post_id, user_id],
    );
    if (deletePost.rowCount === 0)
      return next(new AppError(`Post not deleted,try again later`, 500));
    res.status(200).json({
      message: `post deleted successfully!`,
      timeStamp: new Date().toLocaleString(),
    });
  } catch (err) {
    console.log(`Error Details:${err.message}`);
    next(err);
  }
});

/**
 * @openapi
 * /post/content:
 *   post:
 *     description: Here users can make posts just text for now and get a mail on their mail account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: users post must be in text
 *                 example: This is my first post!
 *     responses:
 *       200:
 *         description: successfully makes the post and will be visible to users who follow you!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: post made by username
 *                 postedAt:
 *                   type: string
 *                   example: 2026-04-02T10:55:00.000Z
 *           
 */












export default router;
