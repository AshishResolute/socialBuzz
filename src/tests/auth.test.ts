import app from "../routes/app.js";
import { expect, describe, test, beforeEach, afterEach } from "vitest";
import request from "supertest";
import pool from "../database/connection.js";

const testMail = `test@email.com`;
const anotherTestMail = `anotherTest@email.com`;
test("Should check the health route", async () => {
  const response = await request(app).get("/health");
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("message");
  expect(response.body.message).toContain("Services Running Well,All Good!");
});

describe(`Should test signup`, () => {
  beforeEach(async () => {
    await pool.query(`delete from users where email=$1 or email=$2`, [
      testMail,
      anotherTestMail,
    ]);
  });
  test(`should successfully create user account`, async () => {
    const input = {
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    };
    const res = await request(app).post("/auth/signup").send(input);
    const findUser = await pool.query(
      `select username from users where email=$1`,
      [testMail],
    );

    expect(findUser.rowCount).toBeGreaterThan(0);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("SignUp Successfull!");
  });

  test(`should return 400 for an invalid email`, async () => {
    const res = await request(app).post("/auth/signup").send({
      email: `invalidEmail`,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain(`Please provide an valid email address`);
  });
  test(`should return 400 for an invalid username`, async () => {
    const res = await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: 999,
    });
    expect(res.status).toBe(400);
    console.log(res.body);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain('"userName" must be a string');
  });
  test(`should return 400 for an invalid password`, async () => {
    const res = await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Testuser",
      confirmPassword: `Testuser`,
      userName: `testUser`,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      `Password must have atleast one lowercase,one UPPERCASE and a Special character`,
    );
  });
  test(`should return 400 when passwords dont match`, async () => {
    const res = await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Testuser`,
      userName: `testUser`,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain(`Passwords do not match`);
  });
  test(`Must return 409 if duplicate email`, async () => {
    await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    });

    const res = await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain(`Duplicate entry`);
  });
  test(`Must return 409 if duplicate userName`, async () => {
    await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    });

    const res = await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain(`Duplicate entry`);
  });
});

describe(`Testing login route`, () => {
  beforeEach(async () => {
    await request(app).post("/auth/signup").send({
      email: testMail,
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    });
  });

  afterEach(async () => {
    await pool.query(`delete from users where email=$1`, [testMail]);
  });

  test(`Should login user successfully`, async () => {
    const res = await request(app).post(`/auth/login`).send({
      email: testMail,
      password: `Test@user`,
    });

    let refreshToken: string | undefined;
    if (Array.isArray(res.header[`set-cookie`])) {
      refreshToken = res.header[`set-cookie`].find((cookie: string) =>
        cookie.includes(`refreshToken`),
      );
    }

    expect(refreshToken).toBeDefined();
    expect(refreshToken).toContain("HttpOnly");
    expect(refreshToken).toContain("SameSite");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(`token`);
    expect(res.body.message).toContain(`Login Success!`);
  });

  test(`should return 400 for invalid email`, async () => {
    const res = await request(app).post("/auth/login").send({
      email: `InvalidEmail`,
      password: `Valid@password`,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(`Invalid Email`);
  });
  test(`should return 400 for invalid password`, async () => {
    const res = await request(app).post("/auth/login").send({
      email: testMail,
      password: `Validpassword`,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      `Password must contain at least one uppercase, one lowercase, and one special character`,
    );
  });

  test(`Should return 401 if user account does not exist`, async () => {
    await pool.query(`delete from users where email=$1`, [testMail]);
    const res = await request(app).post(`/auth/login`).send({
      email: testMail,
      password: `Valid@password`,
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toContain(
      `The email or password provided is incorrect`,
    );
  });

  test(`Should return 400 for invalid Passwords`,async()=>{
    const res = await request(app)
    .post(`/auth/login`)
    .send({
      email:testMail,
      password:`Invalid@password`
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain(`The email or password provided is incorrect`)
  })
});
