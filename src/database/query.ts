import db from "./connection.js";
import type { QueryResult, QueryResultRow } from "pg";

export const query = async <T extends QueryResultRow>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> => {
    return db.query<T>(text,params)
};
