import express from 'express';
import verifyToken from '../middlewears/verifyToken.js';
import { AppError } from '../../ErrorHandler/ErrorClass.js';
import db from '../../database/connection.js'
const router = express.Router();

// get all the posts from those who i follow

router.get('/',verifyToken,async(req,res,next)=>{
    try{
        let user_id=req.user.id;
        let getAllPosts = await db.query(`select p.id,p.content,p.created_at,p.updated_at from posts as p join follow as f on p.user_id=f.following_id where f.follower_id=$1 order by p.updated_at desc`,[user_id]);
        if(getAllPosts.rowCount===0) return res.status(200).json({
            sucess:true,
            message:`Nothing to display,Your Following list is empty!`
        })
        res.status(200).json({
            sucess:true,
            message:`The Posts are:`,
            posts:getAllPosts.rows,
            fetched_at:new Date().toLocaleString()
        })
    }
    catch(err)
    {
        console.log(err.message);
        next(err)
    }
})

export default router