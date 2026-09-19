import {Redis} from 'ioredis';
import {REDIS_URL} from '../config.js'

const redisConnection = new Redis(
 REDIS_URL || 'redis://localhost:6379', 
  { 
    maxRetriesPerRequest: null 
  }
);


redisConnection.on('error',()=>console.log(`Redis connection failed!`));


redisConnection.on('connect',()=>console.log(`Redis connected to upstash server!`));


export default redisConnection;