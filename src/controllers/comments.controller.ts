import type { Request, Response, NextFunction } from "express";
import type {
  validateUserCommentInterface,
  checkUserPostIdInterface,
  UserPostAndCommentIdInterface,
} from "../interfaces/interfaces.ts";
import db from "../database/connection.js";
import {
  AppError,
  CheckIfDatabaseError,
  ClientError,
  DataBaseError,
} from "../ErrorHandler/ErrorClass.js";

export const createUserCommentOnPost = async (
  req: Request<checkUserPostIdInterface, {}, validateUserCommentInterface, {}>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let user_id = req.user?.id;
    let post_id = req.params?.postId;
    let { userComment } = req.body;
    let findPost = await db.query(`select id from posts where id=$1`, [
      post_id,
    ]);
    if (findPost.rowCount === 0)
      return next(
        new ClientError(
          `Post not Found!`,
          404,
          `Post not found,try again later`,
        ),
      );
    let comment = await db.query(
      `insert into comments(post_id,user_id,content) values($1,$2,$3) returning id,commented_on,content`,
      [post_id, user_id, userComment],
    );
    res.status(201).json({
      success: true,
      userComment: comment.rows[0].content,
      commented_at: comment.rows[0].commented_on,
      commentId: comment.rows[0].id,
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database Error:${error.message}`);
      next(new AppError(error.message, 500));
      return;
    } else if (error instanceof Error) {
      console.error(`Standard App Error`);
      next(new AppError(error.message, 500));
      return;
    }
    next(error);
  }
};

export const deleteUserComment = async (
  req: Request<UserPostAndCommentIdInterface, {}, {}, {}>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let user_id = req.user?.id;
    let post_id = req.params.postId;
    let comment_id = req.params.commentId;
    // let findCommentOnPost = await db.query(
    //   `select id from comments where post_id=$1 and id=$2 and user_id=$3`,
    //   [post_id, comment_id, user_id]
    // );
    // if (findCommentOnPost.rowCount === 0){
    //   next(
    //     new ClientError(
    //       `Comment not Found`,
    //       404,
    //       `Comment already deleted or post doesn't exists now!`,
    //     )
    //   );
    //   return
    // }
    let deleteComment = await db.query(
      `delete from comments where id=$1 and user_id=$2 and post_id=$3`,
      [comment_id, user_id, post_id],
    );
    if (!deleteComment.rowCount) {
      next(
        new ClientError(
          `Comment not found`,
          400,
          `Comment already deleted or post doesn't exists now,or you dont own the comment!`,
        ),
      );
      return;
    }
    res.status(200).json({
      success: true,
      message: `Comment deleted!`,
      deleted_at: new Date().toISOString(),
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database Error:${error.message}`);
      res.status(500).json({
        success: false,
        name: error.name,
        code: error.code,
        message: error.message,
        detail: error.detail,
      });
      return;
    } else if (error instanceof Error) {
      console.error(`Standard App Error`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

export const updateUserComment = async (
  req: Request<
    UserPostAndCommentIdInterface,
    {},
    validateUserCommentInterface,
    {}
  >,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let user_id = req.user?.id;
    let post_id = req.params.postId;
    let comment_id = req.params.commentId;

    let { userComment } = req.body;
    let updateComment = await db.query(
      `update  comments set content=$1,updated_at=$2 where post_id=$3 and id=$4 and user_id=$5 returning id,post_id,updated_at`,
      [userComment, new Date().toISOString(), post_id, comment_id, user_id],
    );
    if (!updateComment.rowCount) {
      next(
        new ClientError(
          `Comment not updated`,
          404,
          `Comment doesn't exists or isn't your's or the post is deleted!`,
        ),
      );
      return;
    }
    res.status(200).json({
      message: `update successfull`,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(error);
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
};

export const likeAComment = async (
  req: Request<UserPostAndCommentIdInterface>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const user_id = req.user?.id;
    const comment_id = req.params.commentId;
  try {
    
    // const checkComment = await db.query(`select id from comments where id=$1`, [
    //   comment_id,
    // ]);
    // if (checkComment.rowCount === 0) {
    //   next(
    //     new ClientError(
    //       `Comment not liked`,
    //       404,
    //       `Comment not found,or comment deleted`,
    //     ),
    //   );
    //   return;
    // }
    const addLikeToComment = await db.query(
      `insert into comment_likes(comment_id,user_id) values($1,$2) returning id,comment_id,liked_at`,
      [comment_id, user_id],
    );
    if (!addLikeToComment.rowCount) {
      next(new AppError(`comment not liked!`, 500));
      return;
    }
    res.status(200).json({
      success: true,
      message: `Comment Liked!`,
      liked_at: addLikeToComment.rows[0].liked_at,
    });
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      console.error(`Database Error:${error.message}`);
      if(error.code==='23505'){
        const dislike = await db.query(`delete from comment_likes where comment_id=$1 and user_id=$2`,[comment_id,user_id])
        res.status(200).json({
          success:true,
          message:`Comment like removed`
        })
        return
      }
      else if(error.code==='23503'){
        // FK violation as insert failed when no commentId exists
        res.status(404).json({
          success:false,
          message:`comment doesn't exists`,
          timeStamp:new Date().toISOString()
        })
        return
      }
      next(new DataBaseError(error.message, error.code, 500, error.detail));
      return;
    } else if (error instanceof Error) {
      console.error(`Standard App Error:${error.message}`);
      next(new AppError(error.message, 500));
      return;
    }
    next(error);
  }
};
