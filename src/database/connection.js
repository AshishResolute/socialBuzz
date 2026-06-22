import {Pool} from 'pg';

import { DB_HOST,DB_NAME,DB_USER,DB_PASSWORD,DB_PORT } from '../config.ts';

const pool = new Pool({
    host:DB_HOST||'127.0.0.1',
    user:DB_USER,
    password:DB_PASSWORD,
    database:DB_NAME,
    port:DB_PORT
})


pool.query('select now()',(err,res)=>{
    if(err) return  console.log(`Database Connection Failed,${err.stack}`)
        console.log(`Database Connected at ${res.rows[0].now}`)
})

export default pool