import express from "express";
import joi from "joi";
import db from "../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../ErrorHandler/ErrorClass.js";
import { authLimitter } from "../rateLimitter/rate-limitter.js";
import { login, signUp } from "../controllers/auth.controller.ts";
const router = express.Router();

// for signUp i need email,password,confirmPassword,userName => validate every inputs and store hashed Passwords

router.post("/signup", authLimitter, signUp)

router.post("/login", authLimitter, login);

router.post("/refreshToken", async (req, res, next) => {
  try {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return next(new AppError(`No token recieved`, 401));
    let decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
    let newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_KEY, {
      expiresIn: "15m",
    });
    res.json({ newAccessToken });
  } catch (err) {
    console.log(`Error Details: ${err.message}`);
    next(err);
  }
});

export default router;

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     description: Here users can create their social accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - userName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abc@example.com
 *                 description: Users email address must be an valid email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 28
 *                 description: must have one uppercase,lowercase and a special character with min length of 8
 *                 example: Dummypassword!
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 28
 *                 example: Dummypassword!
 *                 description: must have one uppercase,lowercase and a special character with min length of 8
 *               userName:
 *                 type: string
 *                 description: Must be the name for your account that will be visible to others
 *                 example: Ash Ketchum
 *     responses:
 *      '200':
 *         description: User account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               properties:
 *                 message: SignUp Successfull!
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     description: Users can login to their account returns an JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: true
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abc@example.com
 *                 description: user email to login
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 28
 *                 example: DummyPassword!
 *                 description: password must contain atleast one uppercase,lowercase and a special character
 *     responses:
 *       200:
 *         description: successfull login will display a username and return a token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Login success!
 *                 Details:
 *                   type: string
 *                   description: Welcome Back! userName
 *                 token:
 *                   type: string
 *                   description: contains the jwt token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlck5hbWUiOiJTZXJlbmEiLCJpYXQiOjE3NzUwMDE5MDksImV4cCI6MTc3NTAwMjgwOX0.DityXvZeZ4k85qCUHsS7sAbRRpWPK4hWhe-rX08DqUo
 *
 *
 *
 *
 */
