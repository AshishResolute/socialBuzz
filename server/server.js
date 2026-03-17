import express from 'express';
import app from '../src/routes/main.js';
import {fileURLToPath} from 'url';
import path from 'path';
import dotenv from 'dotenv';

const fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileName);

dotenv.config({path:path.join(__dirname,'../dev.env')});

const PORT = process.env.SERVER_PORT||3000

app.listen(PORT,()=>{
    console.log(`server running at port ${PORT}`)
})
