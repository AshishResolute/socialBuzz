import jwt, { type JwtPayload } from 'jsonwebtoken'





export interface SignUpInterface{
    email:string,
    password:string,
    confirmPassword:string,
    userName:string,
}

export interface LoginInterface{
    email:string,
    password:string
}

export interface UserJWTPayload extends JwtPayload{
    id:number
}