import { serializeResponse } from "../utils/serialize.js";
import { checkUrl, isYouTubeUrl, checkYouTubeAvailability } from "../utils/urlCheck.js";
import {
  createLevel, listLevelsByCourse, updateLevel, toggleLevel, deleteLevel,
   createLessonForLevel, listLessonsByLevel,
  updateLesson, toggleLesson, deleteLesson,
  listLevelsByCourseAndInstructor ,DetailLevel
} from "../services/lesson.service.js";

// Levels (Admin)
export const adminCreateLevel = async (req, res, next) => {
  try { 
    const imageUrl = req.file ? `/uploads/images/courselevel/${req.file.filename}` : null;
    const level = await createLevel(parseInt(req.params.courseId,10), { 
      name: req.body.title, 
      description: req.body.description,
      order: req.body.order ? parseInt(req.body.order,10): 1,
      instructorId: parseInt(req.body.instructorId,10),
      priceUSD: req.body.priceUSD ? parseFloat(req.body.priceUSD) : null, 
      priceSAR: req.body.priceSAR ? parseFloat(req.body.priceSAR) : null,
      isFree: req.body.isFree,
      previewUrl : req.body.previewUrl,
      downloadUrl : req.body.downloadUrl,
      isActive: req.body.isActive || true,
      imageUrl
     }); 
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء المستوى بنجاح",
      data: {
        ...serializeResponse(level)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminListLevels = async (req, res, next) => {
  try { 
    const levels = await listLevelsByCourse(parseInt(req.params.courseId,10)); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة المستويات بنجاح",
      data: levels
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateLevel = async (req, res, next) => {
  try { 
    const imageUrl = req.file ? `/uploads/images/courselevel/${req.file.filename}` : null;
    const level = await updateLevel(parseInt(req.params.id,10), { 
      name: req.body.title, 
      description: req.body.description,
      order: req.body.order ? parseInt(req.body.order,10): 1,
      priceUSD: req.body.priceUSD ? parseFloat(req.body.priceUSD) : null, 
      priceSAR: req.body.priceSAR ? parseFloat(req.body.priceSAR) : null,
      isFree: req.body.isFree === "true",
      previewUrl : req.body.previewUrl,
      downloadUrl : req.body.downloadUrl,
      isActive: req.body.isActive || true,
      imageUrl
     }); 
    res.json({ 
      success: true, 
      message: "تم تحديث المستوى بنجاح",
      data: {
        ...serializeResponse(level)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleLevel = async (req, res, next) => {
  try { 
    const level = await toggleLevel(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل المستوى بنجاح" : "تم تعطيل المستوى بنجاح";
    res.json({ 
      success: true, 
      message,
      data: {
        ...serializeResponse(level)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminDeleteLevel = async (req, res, next) => {
  try {
    await deleteLevel(parseInt(req.params.id, 10));
    res.json({
      success: true,
      message: "تم حذف المستوى بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "المستوى غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

// Lessons (Admin)
export const adminListLessonsByLevel = async (req, res, next) => {
  try { 
    const lessons = await listLessonsByLevel(parseInt(req.params.courseLevelId,10)); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة الدروس بنجاح",
      data: {
        ...serializeResponse(lessons)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminCreateLessonForLevel = async (req, res, next) => {
  try { 
    // Validate external URLs before creating the lesson
    const invalidFields = [];
    // Normalize possible lowercase keys
    const youtubeUrl = req.body.youtubeUrl || req.body.youtubeurl;
    const googleDriveUrl = req.body.googleDriveUrl || req.body.googledriveurl;

    let ytDetail = null;
    if (youtubeUrl) {
      let ytValid = false;
      if (isYouTubeUrl(youtubeUrl)) {
        const yt = await checkYouTubeAvailability(youtubeUrl, { timeoutMs: 8000 });
        ytDetail = yt;
        ytValid = yt.available === true;
      } else {
        const yt = await checkUrl(youtubeUrl, { timeoutMs: 20000, allowRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
        ytDetail = yt;
        ytValid = yt.valid;
      }
      if (!ytValid) invalidFields.push('youtubeUrl');
    }
    if (googleDriveUrl) {
      const gd = await checkUrl(googleDriveUrl, { timeoutMs: 20000, allowRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (!gd.valid) invalidFields.push('googleDriveUrl');
    }

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `روابط غير صالحة: ${invalidFields.join(', ')}`,
        data: { errors: invalidFields, youtube: ytDetail }
      });
    }

    const lesson = await createLessonForLevel(parseInt(req.params.courseLevelId,10), {
      title: req.body.title,
      description: req.body.description,
      youtubeUrl: youtubeUrl,
      youtubeId: req.body.youtubeId,
      googleDriveUrl: googleDriveUrl || null,
      durationSec: req.body.durationSec? parseInt(req.body.durationSec,10): null,
      orderIndex: req.body.orderIndex? parseInt(req.body.orderIndex,10): 0,
      isFreePreview: !!req.body.isFreePreview
    }); 
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء الدرس بنجاح",
      data: {
        ...serializeResponse(lesson)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateLesson = async (req, res, next) => {
  try { 
    // Validate URLs if provided on update
    //const invalidFields = [];
    const youtubeUrl = req.body.youtubeUrl || req.body.youtubeurl;
    const googleDriveUrl = req.body.googleDriveUrl || req.body.googledriveurl;

    if (youtubeUrl) {
      let ytValid = false;
      if (isYouTubeUrl(youtubeUrl)) {
        const yt = await checkYouTubeAvailability(youtubeUrl, { timeoutMs: 20000 });
        ytValid = yt.available === true;
      } else {
        const yt = await checkUrl(youtubeUrl, { timeoutMs: 20000, allowRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
        ytValid = yt.valid;
      }
      if (!ytValid) invalidFields.push('youtubeUrl');
    }
    if (googleDriveUrl) {
      const gd = await checkUrl(googleDriveUrl, { timeoutMs: 20000, allowRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (!gd.valid) invalidFields.push('googleDriveUrl');
    }

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `روابط غير صالحة: ${invalidFields.join(', ')}`,
        data: { errors: invalidFields }
      });
    }

    const lesson = await updateLesson(parseInt(req.params.id,10), {
      title: req.body.title,
      description: req.body.description,
      youtubeUrl: youtubeUrl,
      youtubeId: req.body.youtubeId,
      googleDriveUrl: googleDriveUrl,
      durationSec: req.body.durationSec? parseInt(req.body.durationSec,10): undefined,
      orderIndex: req.body.orderIndex? parseInt(req.body.orderIndex,10): undefined,
      isFreePreview: req.body.isFreePreview
    }); 
    res.json({ 
      success: true, 
      message: "تم تحديث الدرس بنجاح",
      data: {
        ...serializeResponse(lesson)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleLesson = async (req, res, next) => {
  try { 
    const lesson = await toggleLesson(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل الدرس بنجاح" : "تم تعطيل الدرس بنجاح";
    res.json({ 
      success: true, 
      message,
      data: {
        ...serializeResponse(lesson)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const adminDeleteLesson = async (req, res, next) => {
  try {
    await deleteLesson(parseInt(req.params.id, 10));
    res.json({
      success: true,
      message: "تم حذف الدرس بنجاح"
    });
  } catch (e) {
    if (e.code === 'P2025') { // Prisma record not found
      e.statusCode = 404;
      e.message = "الدرس غير موجود";
    } else {
      e.statusCode = e.statusCode || 400;
    }
    next(e);
  }
};

// Public
export const publicListLevelsWithLessons = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await listLevelsByCourse(courseId, { page, limit });
    res.json({
      success: true,
      message: "تم جلب قائمة المستويات بنجاح",
      data: result.data,
      pagination: result.pagination
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const publicListLessonsByLevel = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await listLessonsByLevel(courseLevelId, { page, limit });
    res.json({
      success: true,
      message: "تم جلب قائمة الدروس بنجاح",
      data: result.data,
      pagination: result.pagination
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

// Public: list levels for a course by selected instructor
export const publicListLevelsByCourseAndInstructor = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const instructorId = parseInt(req.params.instructorId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await listLevelsByCourseAndInstructor(courseId, instructorId, { page, limit });
    res.json({
      success: true,
      message: "تم جلب مستويات هذا المدرب للدورة",
      data: result.data,
      pagination: result.pagination
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const publicDetailLevel = async (req, res, next) => {
  try {
    const courseLevelId = parseInt(req.params.courseLevelId, 10);
    const userId = req.user ? req.user.id : null; // Check if user is logged in
    console.log(userId)
    const level = await DetailLevel(courseLevelId, userId);
    res.json({
      success: true,
      message: "تم جلب تفاصيل المستوى بنجاح",
      data: level
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};
