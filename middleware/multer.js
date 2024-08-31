import multer from "multer";
const multerUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const singleAvatar = multerUpload.single("resume");

export {singleAvatar};