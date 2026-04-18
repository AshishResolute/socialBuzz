import request from "supertest";
import { describe, it, expect } from "@jest/globals";
import app from "../routes/main.js";
import endConnections from '../../jest.globalTearDown.js';
import jwt from 'jsonwebtoken'
describe(`Verify Token middlewear Test`, () => {
  it(`should return 401 status  unauthorised request when no token is recieved`, async () => {
    const res = await request(app).get("/feed");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it(`should return 401 status request when an invalid token is received`, async () => {
    const res = await request(app)
      .get("/feed")
      .set("Authorization", `Bearer invalidToken`);

    expect(res.statusCode).toBe(401);

    expect(res.body).toHaveProperty("message");
  });

  it(`should return 401 if token is expired`,async()=>{

    const expiredToken = jwt.sign({id:999},process.env.JWT_KEY,{expiresIn:`0s`})
    const res = await request(app)
    .get('/feed')
    .set('Authorization',`Bearer ${expiredToken}`)
    
    expect(res.statusCode).toBe(401)
    expect(res.body).toHaveProperty('message')
  })
});
