import express from "express";
import verifyToken from "../middlewears/verifyToken.js";
import joi from "joi";
import db from "../../database/connection.js";
import { AppError } from "../../ErrorHandler/ErrorClass.js";

const router = express.Router();

let checkUserContent = joi.object({
  content: joi
    .string()
    .required()
});

router.post("/content", verifyToken, async (req, res, next) => {
  try {
    let user_id = req.user.id;
    let { error, value } = checkUserContent.validate(req.body);
    if (error) {
      error.details.map((err) => console.log(err.message));
      return next(new AppError(`Enter valid Text Content`, 400));
    }
    let { content } = value;
    let findUser = await db.query(`select username from users where id=$1`, [
      user_id,
    ]);
    if (findUser.rowCount === 0)
      return next(new AppError(`User not found`, 404));
    let postAContent = await db.query(
      `insert into posts(content,user_id) values($1,$2) returning user_id,created_at,updated_at`,
      [content, user_id],
    );
    if (postAContent.rowCount === 0)
      return next(new AppError(`Failed To make a Post`, 500));
    res
      .status(200)
      .json({
        message: `post made by ${findUser.rows[0].username}`,
        postedAt:postAContent.rows[0].created_at,
      });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

export default router;
