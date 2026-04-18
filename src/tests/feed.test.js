import request from "supertest";
import { describe, it, expect } from "@jest/globals";
import pool from "../../database/connection.js";
import redisConnection from "../../database/redis.js";
import { emailQueue, postQueue } from "../queues/emailQueue.js";
import app from "../routes/main.js";
import endConnections from '../../jest.globalTearDown.js';
let token, followingUserId, followingUserToken;
beforeAll(async () => {
  await pool.query(`delete from follow`);
  await pool.query(`delete from users`);
  await pool.query(`delete from posts`);
  await pool.query(`delete from comments`);
  await pool.query(`delete from likes`);

  await request(app).post(`/auth/signup`).send({
    email: "feed@test.com",
    password: `Feed@test.com`,
    confirmPassword: `Feed@test.com`,
    userName: `Feed Tester`,
  });

  await request(app).post(`/auth/signup`).send({
    email: "follow@test.com",
    password: `Follow@test.com`,
    confirmPassword: `Follow@test.com`,
    userName: `Following User`,
  });

  const getUserId = await pool.query(`select id from users where email=$1`, [
    "follow@test.com",
  ]);
  followingUserId = getUserId.rows[0].id;

  const getToken = await request(app)
    .post("/auth/login")
    .send({ email: `feed@test.com`, password: `Feed@test.com` });

  const getFollowingUserToken = await request(app)
    .post("/auth/login")
    .send({ email: `follow@test.com`, password: `Follow@test.com` });

  followingUserToken = getFollowingUserToken.body.token;

  token = getToken.body.token;

  const checkFollow = await request(app)
    .post(`/follow/${followingUserId}`)
    .set("Authorization", `Bearer ${token}`);

  const checkPost = await request(app)
    .post(`/post/content`)
    .set("Authorization", `Bearer ${followingUserToken}`)
    .send({
      content: `This is my post which will be seen in the feed of my followers`,
    });
});

afterAll(async () => {
  await pool.query(`delete from follow`);
  await pool.query(`delete from users`);
  await pool.query(`delete from posts`);
  await pool.query(`delete from comments`);
  await pool.query(`delete from likes`);
});

describe(`Feed Route`, () => {
  describe(`GET /feed?page=1&limit=2`, () => {
    it(`Should fetch all the posts from the following users with pagination`, async () => {
      const res = await request(app)
        .get(`/feed`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("posts");
    });
  });
});
