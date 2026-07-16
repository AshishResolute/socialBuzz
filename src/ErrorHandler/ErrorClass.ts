
import type { DatabaseError } from "../interfaces/interfaces.ts";

export class AppError extends Error{
    constructor( message:string, public statusCode:number)
    {
        super(message);
        this.statusCode = statusCode;
    } 
}

export const   CheckIfDatabaseError = (err:unknown):err is DatabaseError=>{
    return err instanceof Error && 'code' in err
} 

export class DataBaseError extends Error{
    constructor(message:string,public code:string,public statusCode:number,public detail?:string ){
        super(message)
        this.name=this.constructor.name
    }
}
export class ClientError extends Error{
    constructor(message:string,public statusCode:number,public details:string){
        super(message)
        this.name=this.constructor.name
    }
}