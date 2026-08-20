import type {Request, Response, NextFunction } from "express";
import { postQueue } from "../queues/emailQueue.js";
import db from "../database/connection.js";
import {
  AppError,
  CheckIfDatabaseError,
  ClientError,
} from "../ErrorHandler/ErrorClass.js";
import type {
  AuthenticatedRequest,
  checkUserContentInterface,
  checkUserPostIdInterface,
  UserPostAndCommentIdInterface
} from "../interfaces/interfaces.js";


export const createUserPost = async (
  req: Request<{}, {}, checkUserContentInterface, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user_id = req.user?.id
    let { content } = req.body;
    const findUser = await db.query(`select username from users where id=$1`, [
      user_id,
    ]);
    if (findUser.rowCount === 0)
      return next(
        new ClientError(
          `User not found`,
          404,
          `User account not found or deleted!`,
        ),
      );
    const postAContent = await db.query(
      `insert into posts(content,user_id) values($1,$2) returning user_id,created_at,updated_at ,id`,
      [content, user_id],
    );
    if (postAContent.rowCount === 0)
      return next(new AppError(`Failed To make a Post`, 500));
      await postQueue.add("postQueue", {
        to: process.env.RESEND_USER_ACCOUNT_NAME,
        message: `New post successfully created!`,
      });
    res.status(201).json({
      success: true,
      message: `post made by ${findUser.rows[0].username}`,
      postId: postAContent.rows[0].id,
      postedAt: postAContent.rows[0].created_at,
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database error ,${(error.message, error.detail)}`);
      return next(new AppError(error.message, 500));
    } else if (error instanceof Error) {
      console.error(`Standard App error: ${error.message}`);
      next(new AppError(error.message, 500));
    }
  }
};

export const updateUserPostContent = async (
  req: AuthenticatedRequest<
    checkUserPostIdInterface,
    {},
    checkUserContentInterface,
    {}
  >,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let user_id = req.user.id;
    let post_id = req.params.postId;
    let findUser = await db.query(
      `select u.username as username,p.id as post_id from users as u join posts as p on u.id = p.user_id where p.user_id=$1 and p.id=$2`,
      [user_id, post_id],
    );
    if (findUser.rowCount === 0)
      return next(new ClientError(`User not Found!`, 404, `No post found!`));
    let { content } = req.body;
    let updatePostContent = await db.query(
      `update posts set content=$1,updated_at=$2 where id=$3 and user_id=$4 returning updated_at`,
      [content, new Date().toISOString(), post_id, user_id],
    );
    // await postQueue.add("postQueue", {
    //   to: process.env.RESEND_USER_ACCOUNT_NAME,
    //   message: `Post successfully updated!`,
    // });
    res.status(200).json({
      message: `post updated successfuly for ${findUser.rows[0].username}`,
      updated_at: updatePostContent.rows[0].updated_at,
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`DataBase error:${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
        details: error.detail || error.cause,
        timeStamp: new Date().toISOString(),
      });
      return;
    }
    if (error instanceof Error) {
      console.error(`Standard App Error:${error.message}`);
      next(new AppError(error.message, 500));
      return;
    }
    next(error);
  }
};

export const deleteUserPost = async (
  req: AuthenticatedRequest<checkUserPostIdInterface, {}, {}, {}>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let user_id = req.user.id;
    let post_id = req.params.postId;
    let findPost = await db.query(
      `select id from posts where id=$1 and user_id=$2`,
      [post_id, user_id],
    );
    if (findPost.rowCount === 0)
      return next(
        new ClientError(
          `Post not found`,
          404,
          `If user account deleted this post have`,
        ),
      );
    await db.query(
      `delete from posts where id=$1 and user_id=$2`,
      [post_id, user_id],
    );
    res.status(200).json({
      success: false,
      message: `post deleted successfully!`,
      timeStamp: new Date().toLocaleString(),
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database Error:${error.message}`);
      next(new AppError(error.message, 500));
      return;
    }
    if (error instanceof Error) {
      console.log(`Error Details:${error.message}`);
      next(new AppError(`error.message`, 500));
      return;
    }
    next(error);
  }
};


export const savePost = async(req:Request<UserPostAndCommentIdInterface>,res:Response,next:NextFunction):Promise<void>=>{
  try{
    const userId = req.user?.id
    if(!userId){
      next(new ClientError(`Unauthorised request`,400,`Login before to continue!`))
      return
    }
    const postId = req.params.postId;
    const removeBookMark = await db.query(`delete from saved_posts where user_id=$1 and post_id=$2`,[userId,postId]);
    if(removeBookMark.rowCount){
      res.status(200).json({
        success:true,
        message:`Bookmark removed for this Post`,
        removed_at:new Date().toISOString()
      })
      return
    }
    const bookmarkPost = await db.query(`insert into saved_posts(user_id,post_id) values($1,$2)`,[userId,postId])
    if(bookmarkPost.rowCount) res.status(200).json({
      success:true,
      message:`Post bookMarked`,
      postId,
      saved_at:new Date().toISOString()
    })
    return
  }
  catch(error){
    if(CheckIfDatabaseError(error)){
      console.error(`Database Error:${error.message}`)
      if(error.code==='23505'){
        res.status(200).json({
          success:true,
          message:`Post already saved!`
        })
        return
      }
      next(new AppError(error.message,500))
      return
    }
    else if(error instanceof Error){
      console.error(`Standard App Error:${error.message}`)
      next(new AppError(error.message,500))
      return
    }
    next(error)
  }
}

export const getSavedPost = async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
  try{
    const userId = req.user?.id
    if(!userId){
      next(new ClientError(`Unauthorised request`,400,`Login before to continue!`))
      return
    }
    const userSavedPosts = await db.query(`select p.content,p.created_at from posts as p join saved_posts as s on s.post_id=p.id where s.user_id=$1`,[userId])
    if(!userSavedPosts.rowCount){
      res.status(200).json({
        success:true,
        message:`BookMark is empty,Saved Posts appears here`,
        viewed_at:new Date().toISOString()
      })
      return
    }
    const bookmarkedPosts = userSavedPosts.rows;
    res.status(200).json({
      success:true,
      message:`Saved Posts Count:${bookmarkedPosts.length}`,
      bookmarkedPosts,
      viewed_at:new Date().toISOString()
    })
  }
  catch(error){
    if(CheckIfDatabaseError(error)){
      console.error(`Database Error:${error.message}`)
      next(new  AppError(error.message,500))
      return
    }
    else if(error instanceof Error){
      console.error(`Standard AppError:${error.message}`)
      next(new AppError(error.message,500))
      return
    }
    next(error)
  }
}

export const removeBookMark = async(req:Request<UserPostAndCommentIdInterface>,res:Response,next:NextFunction):Promise<void>=>{
  try{
    const userId = req.user?.id;
    if(!userId){
      next(new ClientError(`Unauthorised request`,401,`Login before to continue!`))
      return
    }
    const postId= req.params.postId;
    const removeUserBookMark = await db.query(`delete from saved_posts where user_id=$1 and post_id=$2`,[userId,postId]);
    if(!removeUserBookMark.rowCount){
      next(new ClientError(`post not found`,400,`post doesnt exists in bookmarks`))
      return
    }
    res.status(200).json({
      success:true,
      message:`BookMarked removed for post:${postId}`,
      removed_at:new Date().toISOString()
    })
  }
  catch(error){
    if(CheckIfDatabaseError(error)){
      console.error(`Database Error:${error.message}`)
      next(new  AppError(error.message,500))
      return
    }
    else if(error instanceof Error){
      console.error(`Standard AppError:${error.message}`)
      next(new AppError(error.message,500))
      return
    }
    next(error)
  }
}