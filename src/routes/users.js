import express from 'express';
import userInfo from '../controllers/users.contollers.js'
const router=express.Router();


router.get('/user/:username',userInfo)

export default router