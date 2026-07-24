import {Redis} from 'ioredis';
import {REDIS_PORT} from '../config.js'

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: REDIS_PORT || 6379,
    maxRetriesPerRequest: null
})


// redisConnection.on('error',()=>console.log(`Redis connection failed!`));


// redisConnection.on('connect',()=>console.log(`Redis connected locally!`));


export default redisConnection;