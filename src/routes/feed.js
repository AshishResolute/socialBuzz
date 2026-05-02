import express from "express";
import verifyToken from "../middlewears/verifyToken.js";
import { AppError } from "../../ErrorHandler/ErrorClass.js";
import db from "../../database/connection.js";
import redisConnection from "../../database/redis.js";
const router = express.Router();

// get all the posts from those who i follow

router.get("/", verifyToken, async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 3;
    if (isNaN(page) || isNaN(limit))
      return next(new AppError(`Invalid query Parameters provided`, 400));
    let offset = (page - 1) * limit;
    let user_id = req.user.id;
    const cached = await redisConnection.get(`feed:${user_id}:${page}:${limit}`);
    if (cached) {
      return res.status(200).json({
        success: true,
        message: `The Posts are:`,
        posts: JSON.parse(cached),
        fetched_at: new Date().toLocaleString(),
      });
    }
    let getAllPosts = await db.query(
      `select p.id,p.content,u.username,p.created_at,p.updated_at from posts as p join follow as f on p.user_id=f.following_id join users as u on u.id=f.following_id where f.follower_id=$1 order by p.created_at desc limit $2 offset $3`,
      [user_id, limit, offset],
    );
    if (getAllPosts.rowCount === 0)
    {
        const recommendedPosts = await db.query(`select u.username,p.id,p.content,p.created_at,p.updated_at,count(l.id)::int as likes from posts as p join likes as l on p.id=l.post_id join users as u on p.user_id=u.id where p.user_id!=$1 group by l.post_id,p.content,p.created_at,u.username,p.id,p.updated_at  order by count(l.id) desc limit $2`,[user_id,limit])
        if(recommendedPosts.rowCount===0) return res.status(200).json({
          success:true,
          message:`Nothing to show Yet!`,
          fetched_at:new Date().toLocaleString()
        })
       return res.status(200).json({
          success:true,
          message:`Recommended Posts`,
          type:`Recommended`,
          posts:recommendedPosts.rows,
          fetched_at:new Date().toLocaleString()
        })
    }
    await redisConnection.set(
      `feed:${user_id}:${page}:${limit}`,
      JSON.stringify(getAllPosts.rows),
      "EX",
      120,
    );
    res.status(200).json({
      success: true,
      message: `The Posts are:`,
      posts: getAllPosts.rows,
      fetched_at: new Date().toLocaleString(),
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
});

export default router;
