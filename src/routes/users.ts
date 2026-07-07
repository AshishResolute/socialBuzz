import express from 'express';
import userInfo from '../controllers/users.contollers.js'
import { validate } from '../Middlewares/joiValidator.js';
import { validateUserNameSchema} from '../Validator/Validator.js'
const router=express.Router();


router.get('/user/:username',validate({params:validateUserNameSchema}),userInfo)

export default router