import express from "express";
import verifyToken from "../Middlewares/verifyToken.ts";
import type {RequestHandler} from 'express'
import { userPostLimitter } from "../rateLimitter/rate-limitter.js";
// import { postQueue } from "../queues/emailQueue.js";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import {
  createUserPost,
  deleteUserPost,
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
  createUserPost as unknown as RequestHandler,
);

router.put(
  "/editPost/:postId",
  userPostLimitter,
  verifyToken,
  validate({ params: checkUserPostId, body: checkUserContent }),
  updateUserPostContent as unknown as RequestHandler,
);

router.delete(
  "/:postId",
  verifyToken,
  validate({ params: checkUserPostId }),
  deleteUserPost as unknown as RequestHandler,
);

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
