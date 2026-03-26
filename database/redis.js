import {Redis} from 'ioredis';

const redisConnection = new Redis()


redisConnection.on('error',()=>console.log(`Redis connection failed!`));


redisConnection.on('connect',()=>console.log(`Redis connected locally!`));


export default redisConnection;