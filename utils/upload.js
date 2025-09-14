import multer from "multer";
import path from "path";
import fs from "fs";

// تحديد مكان حفظ الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

export const uploadAvatar = multer({ storage });
