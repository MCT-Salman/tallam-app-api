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

// Factory: create storage for generic files (non-image)
const createFileStorage = (folderName) => {
  const uploadPath = path.join(process.cwd(), 'uploads', 'files', folderName);
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
const fileImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for images + videos + pdf
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     'image/',     // كل الصور
//     'video/',     // كل الفيديوهات
//     'application/pdf', // ملفات PDF
//     'application/msword', // ملفات Word
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
//   ];

//   // نشوف هل mimetype يبدأ بـ "image/" أو "video/" أو يطابق أي نوع في القائمة
//   if (
//     allowedTypes.some(type =>
//       file.mimetype.startsWith(type) || file.mimetype === type
//     )
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error('غير مسموح إلا بالصور أو الفيديو أو الملفات المحددة'), false);
//   }
// };

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // قبول الملف
  } else {
    cb(new Error('فقط ملفات PDF مسموحة!'), false); // رفض الملف
  }
};



// Middlewares for different folders
export const uploadSpecializationImage = multer({
  storage: createStorage('specializations'),
  fileFilter: fileImageFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 5MB for images
});

export const uploadCourseImage = multer({
  storage: createStorage('course'),
  fileFilter: fileImageFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 5MB for images
});

export const uploadCourseLevelImage = multer({
  storage: createStorage('courselevel'),
  fileFilter: fileImageFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 5MB for images
});

export const uploadInstructorImage = multer({
  storage: createStorage('instructors'),
  fileFilter: fileImageFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 5MB for images
});

export const uploadUserAvatar = multer({
  storage: createStorage('user'),
  fileFilter: fileImageFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 2MB for user avatars
});

export const uploadNoticeImage = multer({
  storage: createStorage('financial'),
  fileFilter: fileImageFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 3MB for notices
});

export const uploadStoryImage = multer({
  storage: createStorage('stories'),
  fileFilter: fileImageFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 5MB for stories
});

// Generic files upload (allow any mimetype) under uploads/files/general
export const uploadAnyFile = multer({
  storage: createFileStorage('general'),
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 50MB for general files
});


