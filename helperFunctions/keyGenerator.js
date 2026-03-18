import crypto from 'crypto';


let  generateKey=()=>{
    return crypto.randomBytes(16).toString('hex')
}

export default generateKey