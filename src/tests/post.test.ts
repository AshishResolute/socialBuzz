import app from "../routes/app.js";
import pool from "../database/connection.js";
import { test, expect, describe, beforeEach, afterEach } from "vitest";
import request from "supertest";

test(`Testing health route`, async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
});

const testMail = `test@post.com`;

describe(`Testing post creation route`, () => {
  let token = "";
  beforeEach(async () => {
    await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `postUser`,
    });

    const login = await request(app)
      .post("/auth/login")
      .send({ email: testMail, password: `Test@user` });
    token = login.body.token;
  });
  afterEach(async () => {
    await pool.query(`delete from users where email=$1`, [testMail]);
  });

  test(`should return 400 status for invalid post content`, async () => {
    const res = await request(app)
      .post("/post/content")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: 123 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("content must be a string");
  });

  test(`should return 201 status for successfull post creation`, async () => {
    const res = await request(app)
      .post("/post/content")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: `This is an valid post that can be easily read by my followers`,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Your content has been posted");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeTruthy();
  });

  test(`should return 400 status if content length is less than 30 chars`, async () => {
    const res = await request(app)
      .post("/post/content")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: `post has less than 30 chars` });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Content must have atleast 30 characters");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeFalsy();
  });
  test(`should return 400 status if content length is more than 800 chars`, async () => {
    const content: string = new Array(800).fill("A").join("");
    const res = await request(app)
      .post("/post/content")
      .set("Authorization", `Bearer ${token}`)
      .send({ content });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe(
      "Post maximum characters reached(800) characters allowed",
    );
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeFalsy();
  });
});

describe(`Testing update post content route`, () => {
  let token = "";
  let postId: string;
  beforeEach(async () => {
    await request(app).post("/auth/signup").send({
      email: testMail,
      password: `Test@User`,
      confirmPassword: `Test@User`,
      userName: `PostUser`,
    });

    const login = await request(app).post("/auth/login").send({
      email: testMail,
      password: `Test@User`,
    });

    token = login.body.token;

    const post = await request(app)
      .post("/post/content")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: `This is an valid post that can be easily read by my followers`,
      });

    postId = post.body.postId;
  });

  afterEach(async () => {
    await pool.query(`delete from users where email=$1`, [testMail]);
  });

  test(`Should return 400 for invalid postId provided in params`, async () => {
    const res = await request(app)
      .put("/post/editPost/:invalidPostId")
      .send({
        content: `This is a post that i want people to see as the updated one not the old one`,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("PostId must be a valid number");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeFalsy();
  });

  test(`Should return 400 when postId is not a positive number`, async () => {
    const res = await request(app)
      .put("/post/editPost/0")
      .send({
        content: `This is a post that i want people to see as the updated one not the old one`,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("postId must be a positive number");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeFalsy();
  });

  test(`should return 400 status if provided contente is not a string`, async () => {
    const res = await request(app)
      .put(`/post/editPost/:${postId}`)
      .send({
        content: null,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("content must be a string");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeFalsy();
  });

  test(`should return 400 status if content length is less than 30 chars`, async () => {
    const res = await request(app)
      .put(`/post/editPost/:${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: `post has less than 30 chars` });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Content must have atleast 30 characters");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeFalsy();
  });

  test(`should return 400 status if content length is more than 800 chars`, async () => {
    const content: string = new Array(800).fill("A").join("");
    const res = await request(app)
      .put(`/post/editPost/:${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe(
      "Post maximum characters reached(800) characters allowed",
    );
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeFalsy();
  });

  test(`should return 200 status when post is successfully updated`, async () => {
    const res = await request(app)
      .put(`/post/editPost/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: `This is a post that i want people to see as the updated one not the old one`,
      });

    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe(`post updated successfully`);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBeTruthy();
  });
});
