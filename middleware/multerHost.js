import multer from "multer";

export const validExtension = {
  image: ["image/jpg", "image/jpeg", "png", "gif"],
};

const multerHost = (customValidation) => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (customValidation.includes(file.mimetype)) return cb(null, true);

    return cb(new Error("Invalid file type"), false);
  };

  const upload = multer({ storage, fileFilter });

  return upload;
};

export default multerHost;
