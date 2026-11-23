import type { Request, Response, NextFunction } from "express";
import { postQueue } from "../queues/emailQueue.js";
import db from "../database/connection.js";
import { AppError, ClientError } from "../ErrorHandler/ErrorClass.js";
import type {
  checkUserContentInterface,
  checkUserPostIdInterface,
  Posts,
  User,
  UserPostAndCommentIdInterface,
  UserSearchQuery,
} from "../interfaces/interfaces.js";
import type { QueryResult } from "pg";
import { query } from "../database/query.js";
import { catchAsync } from "../util/catchAsync.js";

export const createUserPost = catchAsync(
  async (
    req: Request<{}, {}, checkUserContentInterface, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    let { content } = req.body;

    // removing the first unnecessary db search ,will rely on foreign key constraint if user doesnt exists it just throws a error no need to check if user exists
    const postAContent: QueryResult<User> = await db.query(
      `insert into posts(content,user_id) values($1,$2) returning user_id,created_at,updated_at ,id`,
      [content, user_id],
    );
    if (postAContent.rowCount === 0 || !postAContent.rows[0])
      return next(new AppError(`Failed To make a Post`, 500));
    await postQueue.add("postQueue", {
      to: process.env.RESEND_USER_ACCOUNT_NAME,
      message: `New post successfully created!`,
    });
    const userData = postAContent.rows[0];
    res.status(201).json({
      success: true,
      message: `Your content has been posted`,
      postId: userData.id,
      postedAt: userData.created_at,
    });
  },
);

export const updateUserPostContent = catchAsync(
  async (
    req: Request<checkUserPostIdInterface, {}, checkUserContentInterface, {}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    let user_id = req.user?.id;
    let post_id = req.params.postId;
    if (!post_id) {
      next(new ClientError(`postId  not provided`, 400, `postId not provided`));
      return;
    }
    let { content } = req.body;
    let updatePostContent = await db.query(
      `update posts set content=$1,updated_at=$2 where id=$3 and user_id=$4 returning updated_at`,
      [content, new Date().toISOString(), post_id, user_id],
    );
    const result = updatePostContent.rows[0];
    if (!result) {
      next(new ClientError(`Post not found`, 404, `Post updation failed!`));
      return;
    }
    await postQueue.add("postQueue", {
      to: process.env.RESEND_USER_ACCOUNT_NAME,
      message: `Post successfully updated!`,
    });
    res.status(200).json({
      success: true,
      message: `post updated successfully`,
      updated_at: result.updated_at,
    });
  },
);

export const deleteUserPost = catchAsync(
  async (
    req: Request<checkUserPostIdInterface>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const user_id = req.user?.id;
    const post_id = req.params.postId;

    const deletePost = await db.query(
      `delete from posts where id=$1 and user_id=$2`,
      [post_id, user_id],
    );
    if (deletePost.rowCount === 0) {
      next(
        new ClientError(
          `Post not found`,
          404,
          `Post doesn't exist or you don't own it`,
        ),
      );
      return;
    }
    res.status(200).json({
      success: true,
      message: `post deleted successfully!`,
      timeStamp: new Date().toISOString(),
    });
  },
);

export const savePost = catchAsync(
  async (
    req: Request<UserPostAndCommentIdInterface>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      next(
        new ClientError(
          `Unauthorised request`,
          400,
          `Login before to continue!`,
        ),
      );
      return;
    }
    const postId = req.params.postId;
    const removeBookMark = await db.query(
      `delete from saved_posts where user_id=$1 and post_id=$2`,
      [userId, postId],
    );
    if (removeBookMark.rowCount) {
      res.status(200).json({
        success: true,
        message: `Bookmark removed for this Post`,
        removed_at: new Date().toISOString(),
      });
      return;
    }
    const bookmarkPost = await db.query(
      `insert into saved_posts(user_id,post_id) values($1,$2)`,
      [userId, postId],
    );
    if (bookmarkPost.rowCount) {
      res.status(200).json({
        success: true,
        message: `Post bookMarked`,
        postId,
        saved_at: new Date().toISOString(),
      });
    }
  },
);

export const getSavedPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      next(
        new ClientError(
          `Unauthorised request`,
          400,
          `Login before to continue!`,
        ),
      );
      return;
    }
    const userSavedPosts = await db.query(
      `select p.content,p.created_at,u.username from posts as p join saved_posts as s on s.post_id=p.id join users as u on u.id=p.user_id  where s.user_id=$1`,
      [userId],
    );
    if (!userSavedPosts.rowCount) {
      res.status(200).json({
        success: true,
        message: `BookMark is empty,Saved Posts appears here`,
        viewed_at: new Date().toISOString(),
      });
      return;
    }
    const bookmarkedPosts = userSavedPosts.rows;
    res.status(200).json({
      success: true,
      message: `Saved Posts Count:${bookmarkedPosts.length}`,
      bookmarkedPosts,
      viewed_at: new Date().toISOString(),
    });
  },
);

export const removeBookMark = catchAsync(
  async (
    req: Request<UserPostAndCommentIdInterface>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      next(
        new ClientError(
          `Unauthorised request`,
          401,
          `Login before to continue!`,
        ),
      );
      return;
    }
    const postId = req.params.postId;
    const removeUserBookMark = await db.query(
      `delete from saved_posts where user_id=$1 and post_id=$2`,
      [userId, postId],
    );
    if (!removeUserBookMark.rowCount) {
      next(
        new ClientError(
          `post not found`,
          400,
          `post doesnt exists in bookmarks`,
        ),
      );
      return;
    }
    res.status(200).json({
      success: true,
      message: `BookMarked removed for post:${postId}`,
      removed_at: new Date().toISOString(),
    });
  },
);

export const findPostBySearch = catchAsync(
  async (
    req: Request<{}, {}, {}, UserSearchQuery>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const search = req.validatedQuery?.userQuery;
    if (!search) {
      next(
        new ClientError(
          `No search keyword provided`,
          400,
          `Enter a keyword to search`,
        ),
      );
      return;
    }
    const matchedPosts = await query<Posts>(
      `select id,content from posts where content_tsv @@ plainto_tsquery('english',$1)`,
      [search],
    );
    if (matchedPosts.rowCount === 0) {
      res.status(200).json({
        success: true,
        message: `No posts found,try using clear words to filter/search`,
        timeStamp: new Date().toISOString(),
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: `${matchedPosts.rows.length} posts found`,
      matchedPosts: matchedPosts.rows,
      timeStamp: new Date().toISOString(),
    });
  },
);
