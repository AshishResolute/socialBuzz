import express from 'express';
import {userInfo,updateUserProfileDetails} from '../controllers/users.contollers.js'
import { validate } from '../Middlewares/joiValidator.js';
import { validateUserNameSchema,validateUserProfileUpdateDetails} from '../Validator/Validator.js'
import verifyToken from '../Middlewares/verifyToken.js';
const router=express.Router();


router.get('/user/:username',validate({params:validateUserNameSchema}),userInfo)

router.put('/user/profileUpdate',verifyToken,validate({body:validateUserProfileUpdateDetails}),updateUserProfileDetails)
export default router