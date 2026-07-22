import joi from "joi";
import type {
  SignUpInterface,
  userNameInterface,
  checkUserContentInterface,
  checkUserPostIdInterface,
  validateUserCommentInterface,
  UserPostAndCommentIdInterface,
  UserProfileUpdate,
} from "../interfaces/interfaces.ts";

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
  }),
});

export const loginSchema = joi.object({
  email: joi.string().trim().email().required().messages({
    "string.email": "Enter a valid email",
    "any.required": "Email is required!",
    "string.empty": "Email cannot be empty",
  }),
  password: joi
    .string()
    .trim()
    .min(8)
    .max(28)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, and one special character",
      "string.min": "Password must have atleast 8 characters",
      "string.max": "Password cannot be more than 28 characters",
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
    "string.min": `Content must have atleast 30 characters`,
    "any.required": `Content cannot be empty!`,
  }),
});

export const checkUserPostId = joi.object<checkUserPostIdInterface>({
  postId: joi.number().integer().positive().required().messages({
    "any.required": `PostId is required`,
    "number.base": `PostId must be a valid number`,
    "number.integer": `PostId must be an integer`,
  }),
});

export const validateUserComment = joi.object<validateUserCommentInterface>({
  userComment: joi.string().trim().min(1).max(500).required().messages({
    "string.empty": `Comment cannot be empty`,
    "string.max": `Comment too long(max 500 characters allowed)`,
    "string.min": `Comment too short!`,
    "any.required": `Comment cannot be empty`,
  }),
});

const checkUserParams = joi.number().integer().required().positive().messages({
  "number.base": `Invalid PostId provided`,
  "any.required": `PostId is required`,
  "number.integer": `PostId must be an integer`,
});

export const verifyUserPostAndCommentId =
  joi.object<UserPostAndCommentIdInterface>({
    postId: checkUserParams,
    commentId: checkUserParams,
  });

export const validateCommentId = joi.object<UserPostAndCommentIdInterface>({
  commentId: joi.number().integer().positive().required().messages({
    "any.required": `commentId is required`,
    "number.integer": `Invalid commentId`,
    "number.base": `Invalid type recieved for commentId`,
  }),
});

export const validateUserId = joi.object({
  userId: joi.number().integer().positive().required().messages({
    "any.required": `userId is required`,
    "number.base": `Invalid userId provided!`,
    "number.integer": `Invalid userId provided`,
  }),
});

export const validateUserProfileUpdateDetails = joi.object<UserProfileUpdate>({
  display_name: joi.string().trim().min(3).max(50).messages({
    "string.min": `Display name too short,minimum 3 characters required`,
    "string.max": `Display name too long,max 50 characters allowed`,
    "string.empty": `Provide Display name is empty!`,
  }),
  location: joi.string().trim().max(30).messages({
    "string.max": `location length too long try keeping it short!,max 30 characters allowed`,
    "string.empty": `Provided location is empty!`,
  }),
  socials: joi
    .array()
    .items(joi.string().uri({ scheme: ["http", "https"] }))
    .messages({
      "string.uri": `Invalid url provided,check again!`,
      "string.uriCustomScheme": "Only secure http or https links are allowed.",
    }).max(5).messages({
      'array.base':`Urls must be passed in an array`,
      'array.max':`Maximum 5 urls allowed!`
    }),
  bio: joi.string().trim().min(3).max(200).messages({
    "string.min": `Bio too short,minimum 3 characters required`,
    "string.max": `Bio too long,max 200 characters allowed`,
    "string.empty": `Bio cannot be empty!`
  }),
}).min(1).messages({
  'object.min':`Provide atleast one field to update`
}).unknown(false)
