import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";



export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter:(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error(`Invalid File uploaded only images allowed!`));
}
});
