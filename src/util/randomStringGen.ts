import * as crypto from "node:crypto";
import { promisify } from "node:util";

// const randomStringToken = (bytes:number):string=>{
//    const buffer =  crypto.randomBytes(bytes);
//     return buffer.toString('hex')
// }

// console.log(randomStringToken(32).length)

// better to do it asynchronously

// const randomStringToken = (bytes:number):void=>{
//      crypto.randomBytes(bytes,(error,buffer)=>{
//         if(error) throw error
//        return buffer.toString('hex')
//     })
// }
// need to access data can do it cleanly with async-await but i'll try with callbacks this time

// as the crypto.randomBytes() has a return type of void so cant get the string directly
// i'll simply use async-await
// in this the randomBytes dont have support for promises so need to promisify the function returning a promise

const randomBytesAsync = promisify(crypto.randomBytes);

export const generatePasswordResetToken = async (bytes: number): Promise<string> => {
  try {
    const buffer = await randomBytesAsync(bytes);
    return buffer.toString("hex");
  } catch (error: any) {
    console.error(`Token generation failed:${error.message}`);
    throw error;
  }
};

export const hashPasswordResetToken = (plainText:string):string=>{
  // const hashedToken = crypto.hash('sha256',plainText);
  // let me use the method that wont crash for older node versions
  const hashedToken = crypto.createHash('sha256').update(plainText).digest('hex')
  return hashedToken
}

