import express from "express";
import verifyToken from "../Middlewares/verifyToken.js";
import { validate } from "../Middlewares/joiValidator.js";
import { validateUserId } from "../Validator/Validator.js";
import { followUser,getUserFollowers } from "../controllers/follow.controller.js";

const router = express.Router();

router.post('/:userId',verifyToken,validate({params:validateUserId}),followUser)

router.get('/followers/:userId',validate({params:validateUserId}),getUserFollowers)


export default router;
