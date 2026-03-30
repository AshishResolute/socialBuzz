import { Worker } from "bullmq";
import redisConnection from "../../database/redis.js";
import resend from "../util/resend.js";

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { data, error } = await resend.emails.send({
      from: `socialBuzz <onboarding@resend.dev>`,
      to: job.data.to,
      subject: `Sending mails through background workers to reduce api response time,this time!`,
      html: `<strong>Your post was liked!</strong>`,
    });

    if (error) {
      return console.error(`Error:${error.message}`);
    }
  },
  { connection: redisConnection },
);

emailWorker.on("completed", (job) => {
  console.log(`job with id: ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`job with Id:${job.id} failed\n , Error:${err.message}`);
});

let postWorker = new Worker(
  "postQueue",
  async (job) => {
    const { data, error } = resend.emails.send({
      from: `socialBuzz <onboarding@resend.dev>`,
      to: job.data.to,
      subject: `Notification regarding new Post!`,
      html: `<strong>${job.data.message}<strong/>`,
    });
    if (error)
      return console.error(`Mail not sent,Error Details:${error.mesage}`);
  },
  { connection: redisConnection },
);

postWorker.on('completed',(job)=>{
  console.log(`job completed by postWorker with Id:${job.id}`)
})

postWorker.on('failed',(job,err)=>{
  console.error(`job failed by postWorker with Id:${job.id},ErrorDetails:${err.message}`)
})