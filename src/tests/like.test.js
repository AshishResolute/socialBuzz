import request from "supertest";
import { describe, it, expect } from "@jest/globals";
import pool from "../../database/connection.js";
import redisConnection from "../../database/redis.js";
import { emailQueue, postQueue } from "../queues/emailQueue.js";
import app from "../routes/main.js";
import endConnections from '../../jest.globalTearDown.js';
let token, postId, likeId;
beforeAll(async () => {
  await pool.query(`delete from users`);
  await pool.query(`delete from posts`);
  await pool.query(`delete from comments`);
  await pool.query(`delete from likes`);

  await request(app).post("/auth/signup").send({
    email: `like@test.com`,
    password: `Like@test.com`,
    confirmPassword: `Like@test.com`,
    userName: `likeTester`,
  });

  const getToken = await request(app)
    .post("/auth/login")
    .send({ email: "like@test.com", password: `Like@test.com` });

  token = getToken.body.token;

  const getPostId = await request(app)
    .post("/post/content")
    .set("Authorization", `Bearer ${token}`)
    .send({ content: `Test content to get the postId` });

  postId = getPostId.body.postId;
});

afterAll(async () => {
  await pool.query(`delete from users`);
  await pool.query(`delete from posts`);
  await pool.query(`delete from comments`);
  await pool.query(`delete from likes`);

});

describe("LIKES Routes", () => {
  describe("POST /like/likePost/:PostId", () => {
    it(`Should return 400 if invalid postId id received`, async () => {
      const res = await request(app)
        .post(`/like/likePost/invalidPostId`)
        .set("Authorization", `Bearer ${token}`);

      console.log(res.body);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 404 if post is not found`, async () => {
      const res = await request(app)
        .post(`/like/likePost/${99999}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 200 if user is able to like a post`, async () => {
      const res = await request(app)
        .post(`/like/likePost/${postId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message");

      likeId = res.body.likeId;
    });
  });

  describe('GET /like/likePost/:postId',()=>{

    it(`Should return 400 for an invalid postId`,async()=>{

        const res = await request(app)
        .get(`/like/totalLikes/abcd}`)
        .set('Authorization',`Bearer ${token}`)

        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty('message')
    });

     it(`Should return 404 if post not found or not yet liked`,async()=>{

        const res = await request(app)
        .get(`/like/totalLikes/${-989}`)
        .set('Authorization',`Bearer ${token}`)

        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty('message')
    });

    it(`should return 200 and provide the total likes for an post`,async()=>{

        const res = await request(app)
        .get(`/like/totalLikes/${postId}`)
        .set('Authorization',`Bearer ${token}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('message')
    })
  });

  describe(`DELETE /like/unlikePost/postId`,()=>{

    it(`Should return 400 for an Invalid postId`,async()=>{

        const res = await request(app)
        .delete(`/like/unlikePost/${`abcd`}`)
        .set('Authorization',`Bearer ${token}`)

        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty('message')
    });

    it(`Should return 404 if post not found or not yet liked`,async()=>{

        const res = await request(app)
        .delete(`/like/unlikePost/${9999}`)
        .set('Authorization',`Bearer ${token}`)

        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty(`message`)
    });

    it(`should return 200 if the post is unliked`,async()=>{

        const res = await request(app)
        .delete(`/like/unlikePost/${postId}`)
        .set('Authorization',`Bearer ${token}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty(`message`)
    })
  })
});
