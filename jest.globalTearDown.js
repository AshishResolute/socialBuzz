


export default async () => {
  await pool.end();
  await redisConnection.quit();
  await emailQueue.close();
  await postQueue.close();
};
