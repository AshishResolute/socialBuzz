import type { DatabaseError } from "../interfaces/interfaces.ts";

export class AppError extends Error{
    constructor( message:string, public statusCode:number)
    {
        super(message);
        this.statusCode = statusCode;
    } 
}

let  CheckIfDatabaseError = (err:unknown):err is DatabaseError=>{
    return err instanceof Error && 'code' in err
} 