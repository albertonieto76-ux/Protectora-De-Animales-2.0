import multer from "multer";
const storage = multer.memoryStorage();

const imageFileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|webp/;
  const isValid = allowed.test(file.mimetype);
  cb(null, isValid);
};

export const uploadImages = multer({
  storage,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).array("images", 10);
