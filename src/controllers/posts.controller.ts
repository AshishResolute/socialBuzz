// import type {Request,Response,NextFunction} from 'express'
// import db from '../database/connection.js'
// import { AppError } from '../ErrorHandler/ErrorClass.js';





// export const createUserPost = async (req:Request, res:Response, next:NextFunction) => {
//     try {
//       let user_id = req.user.id;
//       let { error, value } = checkUserContent.validate(req.body);
//       if (error) {
//         error.details.map((err) => console.log(err.message));
//         return next(new AppError(`Enter valid Text Content`, 400));
//       }
//       let { content } = value;
//       let findUser = await db.query(`select username from users where id=$1`, [
//         user_id,
//       ]);
//       if (findUser.rowCount === 0)
//         return next(new AppError(`User not found`, 404));
//       let postAContent = await db.query(
//         `insert into posts(content,user_id) values($1,$2) returning user_id,created_at,updated_at ,id`,
//         [content, user_id],
//       );
//       if (postAContent.rowCount === 0)
//         return next(new AppError(`Failed To make a Post`, 500));
//       await postQueue.add("postQueue", {
//         to: process.env.RESEND_USER_ACCOUNT_NAME,
//         message: `New post successfully created!`,
//       });
//       res.status(201).json({
//         message: `post made by ${findUser.rows[0].username}`,
//         postId:postAContent.rows[0].id,
//         postedAt: postAContent.rows[0].created_at,
//       });
//     } catch (error) {
//       console.log(error.message);
//       next(error);
//     }
//   }