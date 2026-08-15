import express from 'express';
import {userInfo,updateUserProfileDetails,uploadUserProfilePic} from '../controllers/users.contollers.js'
import { validate } from '../Middlewares/joiValidator.js';
import { validateUserNameSchema,validateUserProfileUpdateDetails} from '../Validator/Validator.js'
import verifyToken from '../Middlewares/verifyToken.js';
import { upload } from '../Middlewares/multer.js';
const router=express.Router();


router.get('/user/:username',validate({params:validateUserNameSchema}),userInfo)

router.put('/user/profileUpdate',verifyToken,validate({body:validateUserProfileUpdateDetails}),updateUserProfileDetails)

router.post('/user/profilePhoto',verifyToken,upload.single('profilePic'),uploadUserProfilePic)

export default router