
import app from '../src/routes/app.js';
import { SERVER_PORT } from '../src/config.js';

const PORT = SERVER_PORT||3000

app.listen(PORT,()=>{
    console.log(`server running at port ${PORT}`)
})
