import joi from "joi";
import type { SignUpInterface ,userNameInterface,checkUserContentInterface,checkUserPostIdInterface} from "../interfaces/interfaces.ts";




export const signUpSchema = joi.object<SignUpInterface>({
  email: joi.string().trim().email().required().messages({
    "string.email": "Please provide an valid email address",
    "any.required": "Email cannot be empty",
    "string.empty": "Email is required cannot be empty",
  }),
  password: joi
    .string()
    .trim()
    .min(8)
    .max(28)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      "string.empty": "Password required cannot be empty",
      "string.min": "Password must have atleast 8 characters",
      "string.max": "Password cannot be more than 28 characters",
      "string.pattern.base":
        "Password must have atleast one lowercase,one UPPERCASE and a Special character",
      "any.required": "Password cannot be empty",
    }),
  confirmPassword: joi.ref("password"),
  userName: joi.string().trim().min(3).max(15).required().messages({
    "string.min": "Username must have atleast 3 characters",
    "string.max":
      "Username cannot be more than 15 characters,Try with a shorter Username...",
    "any.required": "Username is required!,Please provide a Username",
    "string.empty": "Username cannot be empty",
  })
});


export const loginSchema = joi.object({
  email: joi.string().trim().email().required().messages({
    "string.email": "Enter a valid email",
    "any.required":"Email is required!",
    "string.empty":"Email cannot be empty"
  }),
  password: joi
    .string().trim()
    .min(8)
    .max(28)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, and one special character",
        "string.min":"Password must have atleast 8 characters",
        "string.max":"Password cannot be more than 28 characters"
    }),
});

export const validateUserNameSchema = joi.object<userNameInterface>({
  username: joi.string().trim().min(3).max(15).required().messages({
    "string.min": `Username must have atleast 3 characters`,
    "string.max": `Username cannot be more than 15 characters`,
    "string.empty": `Username cannot be empty!`,
  }),
});

export const checkUserContent = joi.object<checkUserContentInterface>({
  content: joi.string().trim().min(30).max(800).required().messages({
    "string.empty": `Post content cannot be empty`,
    "string.max": `Post maximum characters reached(800) characters allowed`,
    "string.min":`Content must have atleast 30 characters`,
    "any.required":`Content cannot be empty!`
  }),
});

export const checkUserPostId = joi.object<checkUserPostIdInterface>({
  postId:joi.number().integer().positive().required().messages({
    'any.required':`PostId is required`,
    'number.base':`PostId must be a valid number`,
    'number.integer':`PostId must be an integer`
  })
})