import express from "express";
import verifyToken from "../Middlewares/verifyToken.js";
import joi from "joi";
import db from "../database/connection.js";
import { AppError } from "../ErrorHandler/ErrorClass.js";
import { userPostLimitter } from "../rateLimitter/rate-limitter.js";
import { postQueue } from "../queues/emailQueue.js";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import {
  createUserPost,
  updateUserPostContent,
} from "../controllers/posts.controller.ts";
import { validate } from "../Middlewares/joiValidator.ts";
import { checkUserContent, checkUserPostId } from "../Validator/Validator.ts";
const currentFile = fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFile);
dotenv.config({ path: path.join(__dirname, "../../dev.env") });

const router = express.Router();

router.post(
  "/content",
  userPostLimitter,
  verifyToken,
  validate({ body: checkUserContent }),
  createUserPost,
);

router.put(
  "/editPost/:postId",
  userPostLimitter,
  verifyToken,
  validate({ params: checkUserPostId ,body: checkUserContent, }),
  updateUserPostContent,
);

router.delete("/delete/:postId", verifyToken, async (req, res, next) => {
  try {
    let user_id = req.user.id;
    let post_id = parseInt(req.params.postId);
    if (isNaN(post_id))
      return next(new AppError(`Invalid postId recieved`), 400);
    let findPost = await db.query(`select id from posts where id=$1`, [
      post_id,
    ]);
    if (findPost.rowCount === 0)
      return next(new AppError(`Post not found`, 404));
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

/**
 * @openapi
 * /post/editPost/{postId}:
 *   put:
 *     description: users can update their post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: This should be the id of the post u want to update
 *         schema:
 *           type: integer
 *           example: 1
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
 *                 description: Provide the content to update your post
 *                 example: this is my content to update my previous post content
 *     responses:
 *       200:
 *         description: Successfully updates the post content of user and a mail will be sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: post updated successfully for user
 *                 updated_at:
 *                   type: string
 *                   example: 2026-08-02T10:55:00.000Z
 */

export default router;
