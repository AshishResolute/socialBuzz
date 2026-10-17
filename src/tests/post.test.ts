import app from "../routes/app.js";
import pool from "../database/connection.js";
import { test, expect, describe, beforeEach,afterEach} from "vitest";
import request from "supertest";


test(`Testing health route`, async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
});

const testMail = `test@email.com`;
describe(`Testing post creation route`, () => {
  let token = "";
  beforeEach(async () => {
    await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    });

    const login = await request(app)
      .post("/auth/login")
      .send({ email: testMail, password: `Test@user` });
    token = login.body.token;

  });
  afterEach(async()=>{
    await pool.query(`delete from users where email=$1`,[testMail])
  })
  test(`should return 400 status for invalid post content`, async () => {
    const res = await request(app)
      .post("/post/content")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: 123 });
     
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toBe('content must be a string')

      console.log({
  httpStatus: res.status,
  bodyStatus: res.body.statusCode,
  message: res.body.message,
});
  });
});
