import express from 'express';
import morgan from 'morgan';
import auth from './auth.js';
const app = express();

app.use(express.json());
app.use(morgan('dev'))
app.get('/health',(req,res)=>{
    res.status(200).json({message:`Services Running Well,All Good!`});
})

app.use('/auth',auth)
export default app