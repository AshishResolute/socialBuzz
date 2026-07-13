import express from "express";
import verifyToken from "../Middlewares/verifyToken.js";
import { validate } from "../Middlewares/joiValidator.js";
import {
  checkUserPostId,
  validateUserComment,
  verifyUserPostAndCommentId,
  validateCommentId,
} from "../Validator/Validator.js";
import {
  createUserCommentOnPost,
  deleteUserComment,
  likeAComment,
  updateUserComment,
} from "../controllers/comments.controller.js";

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
  deleteUserComment,
);

router.patch(
  "/:postId/:commentId",
  verifyToken,
  validate({ params: verifyUserPostAndCommentId, body: validateUserComment }),
  updateUserComment,
);

router.post(
  "/like/:commentId",
  verifyToken,
  validate({ params: validateCommentId }),
  likeAComment,
);
export default router;
