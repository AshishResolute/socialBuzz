import { Queue } from "bullmq";
import redisConnection from "../../database/redis.js";

const emailQueue = new Queue("emailQueue", { connection: redisConnection });

const postQueue = new Queue("postQueue", { connection: redisConnection });
export { emailQueue, postQueue };
