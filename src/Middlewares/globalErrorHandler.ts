import type {Request,Response,NextFunction} from 'express';
import {AppError} from '../ErrorHandler/ErrorClass.js';


interface ErrorMessage{
    success:boolean,
    statusCode:number,
    message:string,
}



export const GlobalErrorHandler = (err:Error,req:Request,res:Response,next:NextFunction)=>{
    if(err instanceof AppError){
        const ErrorDetails:ErrorMessage={
            success:false,
            statusCode:err.statusCode,
            message:err.message
        }
        return res.status(err.statusCode).json(ErrorDetails)
    }
    res.status(500).json({
        success:false,
        message:`Internal Server Error`
    })
}