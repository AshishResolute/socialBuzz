import express from 'express';
import morgan from 'morgan';
const app = express();

app.use(express.json());
app.use(morgan('dev'))
app.get('/health',(req,res)=>{
    res.status(200).json({message:`Services Running Well,All Good!`});
})


export default app