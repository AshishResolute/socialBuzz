import express from "express";
import { authLimitter } from "../rateLimitter/rate-limitter.js";
import { forgotPassword, login, refresh, resetPassword, signUp } from "../controllers/auth.controller.js";
import { validate } from "../Middlewares/joiValidator.js";
import { loginSchema, signUpSchema } from "../Validator/Validator.js";
const router = express.Router();



router.post("/signup",authLimitter, validate({body:signUpSchema}), signUp)

router.post("/login",authLimitter,validate({body:loginSchema}), login);

router.post('/refresh',refresh)

router.post('/forgotPassword',forgotPassword)

router.post('/resetPassword/:resetPasswordToken',resetPassword)
export default router;

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new account
 *     description: Here users can create their social accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/_SignUp'
 *     responses:
 *       '201':
 *         description: User account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: SignUp Successfull!
 *       '400':
 *         description: Validation error (invalid email, weak password, etc.)
 *       '409':
 *         description: Email or username already exists
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login To Your Account
 *     description: Users can login to their account returns an JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/_Login'
 *     responses:
 *       '200':
 *         description: successfull login will display a username and return a token along with refresh token as an cookie
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
 *       '401':
 *         'description': Invalid email or password provided
 */
