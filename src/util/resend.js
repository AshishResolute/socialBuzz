import {Resend} from 'resend';
import {fileURLToPath} from 'url';
import path from 'path';
import dotenv from 'dotenv';

const fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileName);

dotenv.config({path:path.join(__dirname,'../../dev.env')});

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;