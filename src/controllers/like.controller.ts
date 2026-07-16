import type { Request,Response,NextFunction } from "express";
import type {checkUserPostIdInterface} from '../interfaces/interfaces.js'
import db from '../database/connection.js'
import { AppError, CheckIfDatabaseError } from "../ErrorHandler/ErrorClass.js";


export const LikePost = async (req:Request<checkUserPostIdInterface>, res:Response, next:NextFunction):Promise<void> => {
  try {
    let user_id = req.user?.id;
    let post_id = req.params.postId
   
    const deleteLike = await db.query(`delete from likes where post_id=$1 and user_id=$2`,[post_id,user_id])

    if(deleteLike.rowCount){
      res.status(200).json({
        success:true,
        message:`Post like removed!`,
        timeStamp:new Date().toISOString()
      })
      return
    }

    const  likeAPost = await db.query(
      `insert into likes(post_id,user_id) values($1,$2) returning id,liked_at`,
      [post_id, user_id]
    );
    
      // await emailQueue.add("emailQueue",{to:`${process.env.RESEND_USER_ACCOUNT_NAME}`})

    res.status(201).json({
      success:true,
      message: `You successfully liked the post with Id${post_id}`,
      likeId: likeAPost.rows[0].id,
      Liked_at: likeAPost.rows[0].liked_at,
    });
  } catch (error) {
    if(CheckIfDatabaseError(error)){
      console.error(`DataBase Error:${error.message}`)
     next(new AppError(error.message,500))
      return
    }
    else if(error instanceof Error){
      console.error(`Standard App Error`)
      next(new AppError(error.message,500))
      return
    }
    next(error);
  }
}