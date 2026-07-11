import express from "express";
import verifyToken from "../Middlewares/verifyToken.ts";
import { validate } from "../Middlewares/joiValidator.ts";
import {
  checkUserPostId,
  validateUserComment,
  verifyUserPostAndCommentId,
} from "../Validator/Validator.ts";
import {
  createUserCommentOnPost,
  deleteUserComment,
} from "../controllers/comments.controller.ts";

const router = express.Router();

router.post(
  "/:postId",
  verifyToken,
  validate({ params: checkUserPostId, body: validateUserComment }),
  createUserCommentOnPost,
);

router.delete(
  "/:postId/:commentId",
  verifyToken,
  validate({ params: verifyUserPostAndCommentId }),
  deleteUserComment
);

// let userCommentValidation = joi.object({
//   userComment: joi.string().trim().min(1).max(500).required().messages({
//     "string.empty": `Comment can't be empty`,
//     "string.max": `Comment too long(500) characters allowed `,
//   }),
// });

// router.patch(
//   "/updateComment/:postId/:commentId",
//   verifyToken,
//   async (req, res, next) => {
//     try {
//       let user_id = req.user.id;
//       let post_id = parseInt(req.params.postId);
//       let comment_id = parseInt(req.params.commentId);
//       let { error, value } = userCommentValidation.validate(req.body);
//       if (error) {
//         error.details.map((err) => console.log(err.message));
//         next(new AppError(`Comment not valid, Try again!`, 400));
//       }
//       let { userComment } = value;
//       if (isNaN(post_id) || isNaN(comment_id))
//         return next(
//           new AppError(`Invalid post_id or comment_id recieved!`, 400),
//         );
//       let findPost = await db.query(
//         `select id from comments where post_id=$1 and id=$2`,
//         [post_id, comment_id],
//       );
//       if (findPost.rowCount === 0)
//         return next(new AppError(`Post or comment not found!`, 403));
//       let updateComment = await db.query(
//         `update  comments set content=$1,updated_at=$2 where post_id=$3 and id=$4 and user_id=$5`,
//         [userComment,new Date().toISOString(), post_id, comment_id, user_id],
//       );
//       if (updateComment.rowCount === 0)
//         return next(AppError(`comment not updated,try again!`, 500));
//       res.status(200).json({
//         message: `update successfull`,
//         updated_at: new Date().toISOString(),
//       });
//     } catch (err) {
//       console.log(err.message);
//       next(err);
//     }
//   },
// );
export default router;
