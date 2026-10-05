import app from "../routes/app.js";
import { expect, describe, test,beforeEach } from "vitest";
import request from "supertest";

test("Should check the health route", async () => {
  const response = await request(app).get("/health");
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("message");
  expect(response.body.message).toContain("Services Running Well,All Good!");
});

describe(`Should test signup`, () => {
  test(`should successfully create user account`, async () => {
    const input = {
      email: "test@email.com",
      password: "Test@user",
      confirmPassword: `Test@user`,
      userName: `testUser`,
    };
    const res = await request(app).post("/auth/signup").send(input);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('SignUp Successfull!')
  });
});
