import multer from "multer";

//Storing in uploads directory
const storage = multer.diskStorage({
  destination: "uploads/",
  filename(_req, file, callback) {
    const fileName = file.originalname;
    callback(null, `${Date.now()}-${fileName}`);
  },
});

//FileFiller
const fileFillter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const allowedTypes = ["application/pdf", "text/csv"];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new Error("only PDF and CSV file allowed"));
  }

  callback(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter: fileFillter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
