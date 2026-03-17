import express from "express";
import joi from "joi";
import db from "../../database/connection.js";
import bcrypt from "bcrypt";
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

router.post("/signup", async (req, res) => {
  try {
    let { error, value } = signUpSchema.validate(req.body);
    if (error) {
      error.details.map((err) => console.log(err.message));
      return res.status(400).json({ message: `Input Validation Failed` });
    }
    let { email, password, userName } = value;
    let hashedPassword = await bcrypt.hash(password, 10);
    let result = await db.query(
      `insert into users(email,password,userName) values($1,$2,$3)`,
      [email, hashedPassword, userName],
    );
    if (result.rowCount === 0)
      return res.status(400).json({ message: `SignUp Failed!` });
    res.status(200).json({ message: `SignUp Successfull!` });
  } catch (err) {
    console.log(`Error:${err.messsage}`);
    res.status(500).json({ messageL: `Internal Server error` });
  }
});


export default router;