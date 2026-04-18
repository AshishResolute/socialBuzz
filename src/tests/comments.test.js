import request from "supertest";
import { describe, it, expect } from "@jest/globals";
import app from "../routes/main.js";
import pool from "../../database/connection.js";
import redisConnection from "../../database/redis.js";
import { emailQueue, postQueue } from "../queues/emailQueue.js";
import endConnections from '../../jest.globalTearDown.js';
let accessToken, userPostId,userCommentId,CommentIdForUpdate;

beforeAll(async () => {
  await pool.query(`delete from users`);
  await pool.query(`delete from posts`);
  await pool.query(`delete from comments`);

  const signupRes = await request(app)
    .post("/auth/signup")
    .send({
      email: `user@test1.com`,
      password: `User@test1.com`,
      confirmPassword: `User@test1.com`,
      userName: `FailedUser`,
    });


  const res = await request(app)
    .post("/auth/login")
    .send({ email: `user@test1.com`, password: `User@test1.com` });

  accessToken = res.body.token;

  const postIdRes = await request(app)
    .post("/post/content")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ content: `This is my post` });

  userPostId = postIdRes.body.postId;
});


describe(`Comment routes`, () => {

  describe(`POST /comment/postComment/:postId`, () => {
    it(`Should return 400 for an invalid comment `, async () => {
      const res = await request(app)
        .post(`/comment/postComment/${userPostId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userComment: 123e8 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(`message`);
    });

    it(`Should return 400 for invalid postId`, async () => {
      const res = await request(app)
        .post(`/comment/postComment/abcd`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userContent: `abcaj` });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 404 if post not found to make an comment`, async () => {
      const res = await request(app)
        .post(`/comment/postComment/${37477373}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userComment: `No comments` });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 201 if user is able to make comment on a post`, async () => {
      const res = await request(app)
        .post(`/comment/postComment/${userPostId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userComment: `Valid Test Comment` });

        userCommentId=res.body.commentId
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message");
     
      const commentForUpdateTest = await request(app)
      .post(`/comment/postComment/${userPostId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userComment: `Valid Test Comment` });
        
        CommentIdForUpdate=commentForUpdateTest.body.commentId
    });
  });

  describe('DELETE /comment/deleteComment/:postId/:commentId',()=>{

    it(`Should return 400 for invalid postId or commentId`,async()=>{

      const res = await request(app)
      .delete(`/comment/deleteComment/abcd/efgh`)
      .set('Authorization',`Bearer ${accessToken}`)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
      
    })

    it(`Should return 404 status if the post or comment is not found`,async()=>{

      const res = await request(app)
      .delete(`/comment/deleteComment/${userPostId}/${9876}`)
      .set('Authorization',`Bearer ${accessToken}`)

      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty('message')
    })

    it(`Should return 200 status if the comment is deleted successfully`,async()=>{

      const res = await request(app)
      .delete(`/comment/deleteComment/${userPostId}/${userCommentId}`)
      .set('Authorization',`Bearer ${accessToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message')
    })
  });

  describe('PATCH /comment/updateComment/:postId/:commentId',()=>{

    it(`Should return 400 for an invalid userComment to update`,async()=>{

      const res = await request(app)
      .patch(`/comment/updateComment/${userPostId}/${CommentIdForUpdate}`)
      .set('Authorization',`Bearer ${accessToken}`)
      .send({userComment:123623})

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    });

    it(`Should return 400 for invalid postId or commentId`,async()=>{

      const res = await request(app)
      .patch(`/comment/updateComment/${userPostId}/dfddg`)
      .set('Authorization',`Bearer ${accessToken}`)
      .send({userComment:`Valid still failed`})

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    });

    it(`Should return 403 status if post or comment not found`,async()=>{

      const res = await request(app)
      .patch(`/comment/updateComment/${userPostId}/${64646464}`)
      .set('Authorization',`Bearer ${accessToken}`)
      .send({userComment:`Will Fail`})

      expect(res.statusCode).toBe(403)
      expect(res.body).toHaveProperty('message')
    });

    it(`Should return 200 status if comment is updated `,async()=>{

      const res = await request(app)
      .patch(`/comment/updateComment/${userPostId}/${CommentIdForUpdate}`)
      .set('Authorization',`Bearer ${accessToken}`)
      .send({userComment:`Will Update the comment`})

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message')
    });
  })
});
