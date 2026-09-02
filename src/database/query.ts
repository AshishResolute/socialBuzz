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
        throw new ClientError(
          `Duplicate entry`,
          400,
          `Account already exists!`,
        );
      }
      throw new DataBaseErrors(error.message, 500, error.code);
    }
    throw error;
  }
};
