import app from "../routes/main.js";
import pool from "../../database/connection.js";
import redisConnection from "../../database/redis.js";
import { emailQueue, postQueue } from "../queues/emailQueue.js";
import request from "supertest";
import { describe, it, expect, afterAll } from "@jest/globals";
import endConnections from '../../jest.globalTearDown.js';
let token, followerID, testUserId;

beforeAll(async () => {
  await pool.query(`delete from follow`);
  await pool.query(`delete from users`);
  await pool.query(`delete from posts`);
  await pool.query(`delete from comments`);
  await pool.query(`delete from likes`);

  await request(app)
    .post("/auth/signup")
    .send({
      email: "follower@test.com",
      password: "Follower@test.com",
      confirmPassword: "Follower@test.com",
      userName: "Follower User",
    });

  await request(app)
    .post("/auth/signup")
    .send({
      email: "following@test.com",
      password: "Following@test.com",
      confirmPassword: "Following@test.com",
      userName: "Following User",
    });

  const getFollowerId = await pool.query(
    `select id from users where email=$1`,
    ["following@test.com"],
  );

  const userId = await pool.query(`select id from users where email=$1`, [
    "follower@test.com",
  ]);
  testUserId = userId.rows[0].id;

  followerID = getFollowerId.rows[0].id;

  const getToken = await request(app)
    .post("/auth/login")
    .send({ email: "follower@test.com", password: "Follower@test.com" });
  token = getToken.body.token;
});

afterAll(async () => {
  await pool.query(`delete from follow`);
  await pool.query(`delete from users`);
  await pool.query(`delete from posts`);
  await pool.query(`delete from comments`);
  await pool.query(`delete from likes`);

  await pool.end();
  await redisConnection.quit();
  await emailQueue.close();
  await postQueue.close();
});

describe("FOLLOW ROUTES", () => {
  describe("POST /follow/:userId", () => {
    it(`Should return 400 for an Invalid follower userId`, async () => {
      const res = await request(app)
        .post(`/follow/abcd`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 400 status, user cannot follow himself`, async () => {
      const res = await request(app)
        .post(`/follow/${testUserId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 404 status if the follower account doesnt exists`, async () => {
      const res = await request(app)
        .post(`/follow/${9999}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message");
    });

    it(`should return 201 status if user is able to follow another user`, async () => {
      const res = await request(app)
        .post(`/follow/${followerID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty(`message`);
    });
  });

  describe(`GET /follow/:userId/followers`, () => {
    it(`should return 400 for an Invalid followerId`, async () => {
      const res = await request(app)
        .get(`/follow/abcd/followers`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 200 and provide the followers count can be zero too", async () => {
      const res = await request(app)
        .get(`/follow/${followerID}/followers`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /follow/:userId/followingUsers", () => {
    it(`should return 400 if invalid following userId is provided`, async () => {
      const res = await request(app)
        .get(`/follow/${`fake`}/followingUsers`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 200 status with  the list of people the user follows `, async () => {
      const res = await request(app)
        .get(`/follow/${followerID}/followingUsers`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe(`DELETE /follow/unfollow/:followingId`, () => {
    it(`Should return 400 if invalid user followingId is provided`, async () => {
      const res = await request(app)
        .delete(`/follow/unfollow/fake`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 400 if the user doesn't follows the user with the provided following userId`, async () => {
      const res = await request(app)
        .delete(`/follow/unfollow/${1234567}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it(`Should return 200 if the user unfollows the user with followingId`, async () => {
      const res = await request(app)
        .delete(`/follow/unfollow/${followerID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
  });
});
