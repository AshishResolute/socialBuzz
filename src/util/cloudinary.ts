import { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } from "../config.js";
import { v2 as cloudinary } from "cloudinary";

const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

cloudinary.config({
  cloud_name: requireEnv(CLOUD_NAME, "CLOUD_NAME"),
  api_key: requireEnv(CLOUD_API_KEY, "CLOUD_API_KEY"),
  api_secret: requireEnv(CLOUD_API_SECRET, "CLOUD_API_SECRET"),
});

export default cloudinary;
