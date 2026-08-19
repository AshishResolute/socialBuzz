import type { Request,Response,NextFunction } from "express";
import db from '../database/connection.js'
import { CheckIfDatabaseError } from "../ErrorHandler/ErrorClass.js";
import { AppError } from "../ErrorHandler/ErrorClass.js";


export const userFeed = async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const userId= req.user?.id;
        const userFeed = await db.query(`select p.content from posts as p join follow as f on p.user_id=f.following_id where f.follower_id=$1`,[userId]);
        if(!userFeed.rowCount){
            res.status(200).json({
                success:true,
                message:`Nothing To show here,Try following someone!`,
                fetched_at:new Date().toISOString()
            })
        }
        const userFeedPosts = userFeed.rows.map((post)=>post)
        res.status(200).json({
            success:true,
            message:`Your Feed is:`,
            userFeedPosts,
            fetched_at:new Date().toISOString()
        })
    }catch (error) {
        if (CheckIfDatabaseError(error)) {
          console.error(`Database Error:${error.message}`);
          next(new AppError(error.message, 500));
          return;
        } else if (error instanceof Error) {
          console.error(`Standard App Error:${error.message}`);
          next(new AppError(error.message, 500));
          return;
        }
        next(error);
      }
}