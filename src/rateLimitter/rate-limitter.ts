import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisConnection from "../database/redis.js";




const generalLimitter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 15,
  message: { error: `Too many requests,Try again later!` },
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
    prefix: `socialBuzz rate limitter:`,
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { error: `Too many login attempts,Wait and try again later!` },
  store:new RedisStore({
         sendCommand:(...args)=>redisConnection.call(...args),
         prefix:`socialBuzz auth limitter:`
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

const userPostLimitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: { error: `Too many posts made,Try again shortly!` },
  store:new RedisStore({
      sendCommand:(...args)=>redisConnection.call(...args),
      prefix:`socialBuzz post limitter`
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimitter = rateLimit({
  windowMs:1*60*1000*60,
  limit:5,
  message:{error:`Rate limit reached for post summarization on requests per min (RPM): Limit 5, Used 5, Requested 1. Please try again after an hour.`},
  store:new RedisStore({
    sendCommand:(...args)=>redisConnection.call(...args),
    prefix:`Ai-PostSummarization-Limit:`
  }),
  standardHeaders:true,
  legacyHeaders:false
})
export { generalLimitter, authLimitter, userPostLimitter,aiLimitter };
