import express from "express";
import joi from "joi";
import db from "../../database/connection.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
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


let loginSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Enter a valid email'
  }),
  password: joi.string()
    .min(8)
    .max(28)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, and one special character'
    })
});
router.post('/login',async(req,res)=>{
  try{
        let {error,value} = loginSchema.validate(req.body);
        if(error)
        {
          error.details.map(err=>console.log(err.message));
          return res.status(400).json({message:`Input Validation failed,check the Input Details`})
        }
        let {email,password} = value;
        let findUser = await db.query(`select * from users where email=$1`,[email]);
        if(findUser.rowCount===0) return res.status(404).json({message:`User not Found!`});
        let verifyPassword = await bcrypt.compare(password,findUser.rows[0].password);
        if(!verifyPassword) return res.status(400).json({message:`Passwords Don't match,Login Failed!`});
        let token = await jwt.sign({id:findUser.rows[0].id,userName:findUser.rows[0].username},process.env.JWT_KEY,{expiresIn:'15m'});
        res.status(200).json({message:`Login Success!`,Details:`Welcome Back! ${findUser.rows[0].username}`,token})
  }
  catch(err) {
    console.log(`Error:${err.messsage}`);
    res.status(500).json({ messageL: `Internal Server error` });
  }
})
export default router;