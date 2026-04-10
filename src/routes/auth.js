import express from "express";
import joi from "joi";
import db from "../../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../ErrorHandler/ErrorClass.js";
import { authLimitter } from "../rateLimitter/rate-limitter.js";
const router = express.Router();

// for signUp i need email,password,confirmPassword,userName => validate every inputs and store hashed Passwords

const signUpSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "Please provide an valid email address",
  }),
  password: joi
    .string()
    .min(8)
    .message("password must be atleast 8 characters long")
    .max(28)
    .message("password too lengthy!")
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .message(
      "password must contain atleast one loweCase,upperCase and a special character",
    )
    .required(),
  confirmPassword: joi.ref("password"),
  userName: joi
    .string()
    .min(3)
    .message("Username Too short")
    .max(15)
    .message("Username exceeds max length!")
    .required(),
});

router.post("/signup", authLimitter, async (req, res, next) => {
  try {
    let { error, value } = signUpSchema.validate(req.body);
    if (error) {
      error.details.map((err) => console.log(err.message));
      return next(
        new AppError(`Input Validation Failed!,check entered details`, 400),
      );
    }
    let { email, password, userName } = value;
    let hashedPassword = await bcrypt.hash(password, 10);
    let result = await db.query(
      `insert into users(email,password,userName) values($1,$2,$3)`,
      [email, hashedPassword, userName],
    );
    if (result.rowCount === 0)
      return next(new AppError(`Signup Failed!,Try Again Later`, 500));
    res.status(201).json({ message: `SignUp Successfull!` });
  } catch (err) {
    console.log(`Error:${err}`);
    res.status(500).json({ message: `Internal Server error` });
  }
});

let loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "Enter a valid email",
  }),
  password: joi
    .string()
    .min(8)
    .max(28)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, and one special character",
    }),
});
router.post("/login", authLimitter, async (req, res, next) => {
  try {
    let { error, value } = loginSchema.validate(req.body);
    if (error) {
      error.details.map((err) => console.log(err.message));
      return next(
        new AppError(`Input Validation Failed,Check entered Details`, 400),
      );
    }
    let { email, password } = value;
    let findUser = await db.query(`select * from users where email=$1`, [
      email,
    ]);
    if (findUser.rowCount === 0)
      return next(new AppError(`User not Found!`, 404));
    let verifyPassword = await bcrypt.compare(
      password,
      findUser.rows[0].password,
    );
    if (!verifyPassword)
      return next(
        new AppError(`Passwords Don't match,Try Again Login Failed!`, 400),
      );
    let token = await jwt.sign(
      { id: findUser.rows[0].id, userName: findUser.rows[0].username },
      process.env.JWT_KEY,
      { expiresIn: "15m" },
    );
    let refreshToken = await jwt.sign(
      { id: findUser.rows[0].id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 86400000,
      sameSite: "strict",
    });
    res.status(200).json({
      message: `Login Success!`,
      Details: `Welcome Back! ${findUser.rows[0].username}`,
      token,
    });
  } catch (err) {
    console.log(`Error:${err.messsage}`);
    next(err);
  }
});

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
