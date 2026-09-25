import {
  CheckIfDatabaseError,
  ClientError,
  DataBaseErrors,
} from "../ErrorHandler/ErrorClass.js";
import db from "./connection.js";
import type { QueryResult, QueryResultRow } from "pg";

export const query = async <T extends QueryResultRow>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> => {
  try {
    return await db.query<T>(text, params);
  } catch (error) {
    if (CheckIfDatabaseError(error)) {
      if (error.code === "23505") {
        if(error.constraint?.includes('username')){
          throw new ClientError(`username already taken`,409,`Duplicate username`)
        } 

        if(error.constraint?.includes('email')){
          throw new ClientError(`email already registered`,409,`Duplicate email`)
        }

        throw new ClientError(
          `Duplicate entry`,
          409,
          error.message,
        );
      }
      throw new DataBaseErrors(error.message, 500, error.code);
    }
    throw error;
  }
};
