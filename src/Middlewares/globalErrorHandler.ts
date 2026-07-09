import type {Request,Response,NextFunction} from 'express';
import {AppError} from '../ErrorHandler/ErrorClass.js';


interface ErrorMessage{
    success:boolean,
    statusCode:number,
    message:string,
}



export const GlobalErrorHandler = (err:Error,_req:Request,res:Response,_next:NextFunction):void=>{
    if(err instanceof AppError){
        const ErrorDetails:ErrorMessage={
            success:false,
            statusCode:err.statusCode,
            message:err.message
        }
        res.status(err.statusCode).json(ErrorDetails)
        return
    }
    res.status(500).json({
        success:false,
        message:`Internal Server Error`
    })
}