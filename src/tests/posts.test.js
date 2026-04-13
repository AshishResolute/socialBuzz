import request from "supertest";
import { describe, expect, it } from "@jest/globals";
import pool from "../../database/connection.js";
import redisConnection from "../../database/redis.js";
import app from "../routes/main.js";
import { emailQueue, postQueue } from "../queues/emailQueue.js";
import jwt from "jsonwebtoken";
let accessToken;
let postId;

beforeAll(async () => {
  await pool.query(`delete from users`);
  await request(app).post("/auth/signup").send({
    email: "user@test.com",
    password: "User@test.com",
    confirmPassword: `User@test.com`,
    userName: `Test User`,
  });

  const res = await request(app)
    .post("/auth/login")
    .send({ email: `user@test.com`, password: `User@test.com` });

  accessToken = res.body.token;
});

afterAll(async () => {
  await pool.end();
  await redisConnection.quit();
  await emailQueue.close();
  await postQueue.close();
});

describe(`POST routes`, () => {
  describe(`POST post/content`, () => {
    it(`Should return 400 for Invalid post content`, async () => {
      const res = await request(app)
        .post("/post/content")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: 1223 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(`message`);
    });

    it(`Should return 404 if user dont have an account yet`, async () => {
      const falseUserIdToken = jwt.sign({ id: 1000 }, process.env.JWT_KEY);
      const res = await request(app)
        .post("/post/content")
        .set("Authorization", `Bearer ${falseUserIdToken}`)
        .send({ content: "122" });
      expect(res.statusCode).toBe(404);
    });

    it(`Should return 201 if the user post is successfully made`, async () => {
      const res = await request(app)
        .post("/post/content")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: `1223` });

      postId = res.body.postId;
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty(`message`);
    });
  });

  describe("PUT /post/editPost/:postId", () => {
    it(`Should return 200 for successfully updating post content`, async () => {
      const res = await request(app)
        .put(`/post/editPost/${Number(postId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: `Updating my Post` });
      console.log(res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 400 if post content is invalid`, async () => {
      const res = await request(app)
        .put(`/post/editPost/${postId}`)
        .set("Authorization", `Beaarer ${accessToken}`)
        .send({ content: 1234 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 404 if user does not exist`, async () => {
      const mockFakeUserToken = jwt.sign({ id: 5678 }, process.env.JWT_KEY);
      console.log(mockFakeUserToken);
      const res = await request(app)
        .put(`/post/editPost/${postId}`)
        .set("Authorization", `Bearer ${mockFakeUserToken}`)
        .send({ content: "I am a Fake user" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe('DELETE post/delete/:postId',()=>{

    it('Should return 404 if post not found',async()=>{

      const res = await request(app)
      .delete(`/post/delete/${-1*postId}`)
      .set('Authorization',`Bearer ${accessToken}`)

      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty('message')
    });

    it(`Should return 200 if post is deleted successfully`,async()=>{

      const res = await request(app)
      .delete(`/post/delete/${postId}`)
      .set('Authorization',`Bearer ${accessToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message')
    })
  })
});
