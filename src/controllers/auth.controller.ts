import type { Request, Response, NextFunction } from "express";
import type { SignUpInterface } from "../interfaces/interfaces.ts";
import joi from "joi";
import { signUpSchema } from "../Validator/Validator.ts";
import { AppError } from "../ErrorHandler/ErrorClass.js";
import bcrypt from "bcrypt";
import db from "../database/connection.js";

export const SignUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { error, value } = signUpSchema.validate(req.body) as {
      error?: joi.ValidationError;
      value: SignUpInterface;
    };
    if (error) {
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
};
