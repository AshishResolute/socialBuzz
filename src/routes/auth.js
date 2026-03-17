import express from "express";
import joi from "joi";

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
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
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


