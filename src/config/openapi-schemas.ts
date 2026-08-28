import joiToSwagger from 'joi-to-swagger';
import { loginSchema, signUpSchema,checkUserContent } from '../Validator/Validator.js';


const { swagger: _SignUp } = (joiToSwagger).default(signUpSchema); 
const {swagger:_Login} = joiToSwagger.default(loginSchema)
const {swagger:_PostContent} = joiToSwagger.default(checkUserContent)
export const generatedSchemas={
    _SignUp:{
        ...signUpSchema,
        example:{
            email:"dummy@user.com",
            password:"@Dummy_password",
            confirmPassword:"@Dummy_password",
            userName:"Dummy"
        }
    },
    _Login:{
        ...loginSchema,
        example:{
            email:"dummy@user.com",
            password:"@Dummy_password"
        }
    },
    _PostContent:{
        ...checkUserContent,
        example:{
            content:`This is my First post and it feels great to post here!`
        }
    }
}