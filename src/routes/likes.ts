import express from "express";
import {checkUserPostId} from '../Validator/Validator.js'
import { validate } from "../Middlewares/joiValidator.js";
import verifyToken from "../Middlewares/verifyToken.js";
import { getTotalLikesOnPost, LikePost } from "../controllers/like.controller.js";
const router = express.Router();

router.post("/likePost/:postId", verifyToken,validate({params:checkUserPostId}),LikePost);

// router.delete("/unlikePost/:postId", verifyToken, async (req, res, next) => {
//   try {
//     let user_id = req.user.id;
//     let post_id = parseInt(req.params.postId);
//     if (isNaN(post_id)) return next(new AppError(`Invalid PostId!`, 400));
//     let findPost = await db.query(
//       `select id as like_id,post_id from likes where post_id=$1 and user_id=$2`,
//       [post_id, user_id],
//     );
//     if (findPost.rowCount === 0)
//       return next(new AppError(`Post not Found or Liked yet!`, 404));
//     let deletePost = await db.query(`delete from likes where id=$1`, [
//       findPost.rows[0].like_id,
//     ]);
//     if (deletePost.rowCount === 0)
//       return next(new AppError(`Post is still Liked,unlike Failed!`, 500));
//     res.status(200).json({
//       message: `Post unliked successfully!`,
//       TimeStamp: `Unliked Post at ${new Date().toISOString()}`,
//     });
//   } catch (err) {
//     console.log(err.message);
//     next(err);
//   }
// });

router.get('/getLikes/:postId',validate({params:checkUserPostId}),getTotalLikesOnPost)

export default router;
