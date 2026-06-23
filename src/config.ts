import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filePath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filePath)

dotenv.config({path:path.join(__dirname,'../dev.env')})

export const SERVER_PORT = process.env.SERVER_PORT

export const DB_HOST = process.env.DB_HOST

export const DB_USER = process.env.DB_USER

export const DB_PASSWORD = process.env.DB_PASSWORD

export const DB_NAME = process.env.DB_NAME

export const DB_PORT = process.env.DB_PORT

export const JWT_ACCESS_KEY = process.env.JWT_KEY

export const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY