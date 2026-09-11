import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisConnection from "../database/redis.js";
import type { SendCommandFn } from "rate-limit-redis";
import type { RedisReply } from "rate-limit-redis";

const sendCommand: SendCommandFn = (...args: string[]) => {
  const [command, ...rest] = args;
  return redisConnection.call(command!, ...rest) as Promise<RedisReply>;
};

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 15,
  message: { error: "Too many requests, try again later!" },
  store: new RedisStore({
    sendCommand,
    prefix: "socialbuzz:rate-limiter:",
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { error: `Too many login attempts,Wait and try again later!` },
  store: new RedisStore({
    sendCommand,
    prefix: `socialBuzz auth limitter:`,
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

const userPostLimitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: { error: `Too many posts made,Try again shortly!` },
  store: new RedisStore({
    sendCommand,
    prefix: `socialBuzz post limitter`,
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimitter = rateLimit({
  windowMs: 1 * 60 * 1000 * 60,
  limit: 5,
  message: {
    error: `Rate limit reached for post summarization on requests per min (RPM): Limit 5, Used 5, Requested 1. Please try again after an hour.`,
  },
  store: new RedisStore({
    sendCommand,
    prefix: `Ai-PostSummarization-Limit:`,
  }),
  standardHeaders: true,
  legacyHeaders: false,
});
export { generalLimiter, authLimitter, userPostLimitter, aiLimitter };
