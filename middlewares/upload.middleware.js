import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper: Ensure directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Factory: create storage for a given folder
const createStorage = (folderName) => {
  const uploadPath = path.join(process.cwd(), 'uploads', 'images', folderName);
  ensureDirExists(uploadPath);

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Middlewares for different folders
export const uploadSpecializationImage = multer({
  storage: createStorage('specializations'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadCourseImage = multer({
  storage: createStorage('course'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadInstructorImage = multer({
  storage: createStorage('instructors'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadUserAvatar = multer({
  storage: createStorage('user'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadNoticeImage = multer({
  storage: createStorage('financial'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

