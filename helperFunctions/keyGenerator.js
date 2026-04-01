import crypto from 'crypto';


let  generateKey=()=>{
    return crypto.randomBytes(16).toString('hex')
}

console.log(generateKey())

export default generateKey