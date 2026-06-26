import type { Request, Response, NextFunction } from "express";
import type {
  SignUpInterface,
  LoginInterface,
} from "../interfaces/interfaces.ts";
import { AppError } from "../ErrorHandler/ErrorClass.js";
import bcrypt from "bcrypt";
import db from "../database/connection.js";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from "../config.ts";


export const signUp = async (
  req: Request<{}, {}, SignUpInterface>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let { email, password, userName } = req.body;

    let hashedPassword = await bcrypt.hash(password, 10);

    let result = await db.query(
      `insert into users(email,password,userName) values($1,$2,$3)`,
      [email, hashedPassword, userName],
    );
    if (result.rowCount === 0)
      return next(new AppError(`Signup Failed!,Try Again Later`, 500));
    res.status(201).json({ message: `SignUp Successfull!` });
  } catch (err) {
    if (err.code === "23505") {
      res
        .status(400)
        .json({ message: `Account already exists,Try with logging in!` });
      return;
    }
    res.status(500).json({ message: `Internal Server error` });
  }
};

export const login = async (
  req: Request<{}, {}, LoginInterface>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let { email, password } = req.body;
    let findUser = await db.query(`select * from users where email=$1`, [
      email,
    ]);
    if (findUser.rowCount === 0) {
      res
        .status(401)
        .json({
          success: false,
          message: `The email or password provided is incorrect`,
        });
      return;
    }

    let verifyPassword = await bcrypt.compare(
      password,
      findUser.rows[0].password,
    );
    if (!verifyPassword)
      return next(
        new AppError(`The email or password provided is incorrect`, 400),
      );
    let token = await jwt.sign(
      { id: findUser.rows[0].id, userName: findUser.rows[0].username },
      JWT_ACCESS_KEY!, // '!' added it here as i am sure the .env will load the variable here it wont be undefined it will always be a string
      { expiresIn: "15m" },
    );
    let refreshToken = await jwt.sign(
      { id: findUser.rows[0].id },
      JWT_REFRESH_KEY!,
      { expiresIn: "7d" },
    );
    const hashedRefreshToken = await bcrypt.hash(refreshToken,10)
    const exipryTimeInSevenDays = 1*60*1000*60*24*7
    const insertRefreshToken = await db.query(`insert into refresh_token(user_id,token_hash,expires_at) values($1,$2,$3)`,[findUser.rows[0].id,hashedRefreshToken,(new Date(Date.now()+exipryTimeInSevenDays).toISOString())])
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1*60*1000*60*24*7,
      sameSite: "strict",
    });
    res.status(200).json({
      message: `Login Success!`,
      Details: `Welcome Back! ${findUser.rows[0].username}`,
      token,
    });
  } catch (error) {
    console.error(`Error:${(error as Error).message}`);
    next(error);
  }
};
