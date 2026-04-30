import db from "../../database/connection.js";
import { AppError } from "../../ErrorHandler/ErrorClass.js";
import joi from "joi";
import redisConnection from "../../database/redis.js";

const validateUserName = joi.object({
  username: joi.string().trim().min(3).max(15).required().messages({
    "string.min": `Username must have atleast 3 characters`,
    "string.max": `Username cannot be more than 15 characters`,
    "string.empty": `Username cannot be empty!`,
  }),
});
let userInfo = async (req, res, next) => {
  try {
    let { error, value } = validateUserName.validate(req.params);
    if (error) return next(new AppError(`${error.message}`, 404));
    const cachedUserData = await redisConnection.get(value.username);
    console.log(JSON.parse(cachedUserData))
    if(cachedUserData) return res.status(200).json({
      success:true,
      message:`${value.username} profile Details`,
      joined_at:JSON.parse(cachedUserData).created_at,
      followers:JSON.parse(cachedUserData).followers_count,
      posts:JSON.parse(cachedUserData).posts
    })
    let userInfo = await db.query(`select u.username as username,u.created_at as created_at,(select count(f.follower_id) from follow as f where f.following_id=u.id) as followers_count,COALESCE(ARRAY_AGG(p.content)) as posts from users as u left join posts as p on u.id=p.user_id where u.username=$1 group by u.username,u.created_at,u.id `, [
      value.username,
    ]);
    if (userInfo.rowCount === 0)
      return next(new AppError(`User not found`, 404));
    await redisConnection.set(value.username,JSON.stringify(userInfo.rows[0]),'EX',120)

    res.status(200).json({
      success: true,
      details: userInfo.rows[0],
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

export default userInfo;
