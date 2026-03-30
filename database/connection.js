import {Pool} from 'pg';
import {fileURLToPath} from 'url';
import path from 'path';
import dotenv from 'dotenv';
const currentFile = fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFile);

dotenv.config({path:path.join(__dirname,'../dev.env')})


const pool = new Pool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
})

pool.query('select now()',(err,res)=>{
    if(err) return  console.log(`Database Connection Failed,${err.stack}`)
        console.log(`Database Connected at ${res.rows[0].now}`)
})

export default pool