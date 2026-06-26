import express from "express";
import { authLimitter } from "../rateLimitter/rate-limitter.js";
import { login, refresh, signUp } from "../controllers/auth.controller.ts";
import { validate } from "../Middlewares/joiValidator.ts";
import { loginSchema, signUpSchema } from "../Validator/Validator.ts";
const router = express.Router();

// for signUp i need email,password,confirmPassword,userName => validate every inputs and store hashed Passwords

router.post("/signup",authLimitter, validate({body:signUpSchema}), signUp)

router.post("/login",authLimitter,validate({body:loginSchema}), login);

router.post('/refresh',refresh)

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
