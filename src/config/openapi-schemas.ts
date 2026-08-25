import joiToSwagger from 'joi-to-swagger';
import { signUpSchema } from '../Validator/Validator.js';


const { swagger: SignUp } = (joiToSwagger).default(signUpSchema); 


export const generatedSchemas={
    SignUp
}