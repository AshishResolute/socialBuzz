import express from 'express';
import verifyToken from '../middlewears/verifyToken.js';
import { AppError } from '../../ErrorHandler/ErrorClass.js';
import db from '../../database/connection.js'
const router = express.Router();

// get all the posts from those who i follow

router.get('/',verifyToken,async(req,res,next)=>{
    try{
        console.log(req.query)
        let page=parseInt(req.query.page)||1;
        let limit = parseInt(req.query.limit)||3;
        if(isNaN(page)||isNaN(limit)) return next(new AppError(`Invalid query Parameters provided`,400));
        let offset = (page-1)*limit;
        let user_id=req.user.id;
        let getAllPosts = await db.query(`select p.id,p.content,u.username,p.created_at,p.updated_at from posts as p join follow as f on p.user_id=f.following_id join users as u on u.id=f.following_id where f.follower_id=$1 order by p.created_at desc limit $2 offset $3`,[user_id,limit,offset]);
        if(getAllPosts.rowCount===0) return res.status(200).json({
            success:true,
            message:`Nothing to display,Your Following list is empty!`
        })
        res.status(200).json({
            success:true,
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