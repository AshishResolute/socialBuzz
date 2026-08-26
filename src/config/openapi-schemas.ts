import joiToSwagger from 'joi-to-swagger';
import { loginSchema, signUpSchema } from '../Validator/Validator.js';


const { swagger: SignUp } = (joiToSwagger).default(signUpSchema); 
const {swagger:Login} = joiToSwagger.default(loginSchema)

export const generatedSchemas={
    SignUp:{
        ...signUpSchema,
        example:{
            email:"dummy@user.com",
            password:"@Dummy_password",
            confirmPassword:"@Dummy_password",
            userName:"Dummy"
        }
    },
    Login:{
        ...loginSchema,
        example:{
            email:"dummy@user.com",
            password:"@Dummy_password"
        }
    }
}