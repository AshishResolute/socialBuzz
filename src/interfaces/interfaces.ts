import  { type JwtPayload } from 'jsonwebtoken'





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

export interface DatabaseError extends Error{
    code:string;
    table?:string;
    constraint?:string;
    detail?:string
}

export interface userNameInterface{
    username?:string;
}