
import app from '../src/routes/app.ts';
import { SERVER_PORT } from '../src/config.ts';

const PORT = SERVER_PORT||3000

app.listen(PORT,()=>{
    console.log(`server running at port ${PORT}`)
})
