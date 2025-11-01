import { serializeResponse } from "../utils/serialize.js";
import { checkUrl, isYouTubeUrl, checkYouTubeAvailability } from "../utils/urlCheck.js";
import { deleteFile } from "../utils/deleteFile.js";
import {
  listCodeLevels, getLevelByEncode,
  getLevelById, createLevel, listLevelsByCourse, updateLevel, toggleLevel, deleteLevel,
  createLessonForLevel, listLessonsByLevel,
  updateLesson, toggleLesson, deleteLesson,
  listLevelsByCourseAndInstructor, DetailLevel
} from "../services/lesson.service.js";

// Levels (Admin)
export const adminListCodeLevels = async (req, res, next) => {
  try {
    const levels = await listCodeLevels();
    res.json({
      success: true,
      message: "تم جلب قائمة أكواد المستويات بنجاح",
      data: levels
    });
  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminDetailLevel = async (req, res, next) => {
  try {
    const level = await getLevelByEncode(req.params.encode);
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

export const adminCreateLevel = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/images/courselevel/${req.file.filename}` : null;

    const level = await createLevel(parseInt(req.params.courseId, 10), {
      name: `المستوى ${req.body.order}`,
      description: req.body.description,
      order: req.body.order ? parseInt(req.body.order, 10) : 1,
      instructorId: parseInt(req.body.instructorId, 10),
      priceUSD: req.body.priceUSD ? parseFloat(req.body.priceUSD) : null,
      priceSAR: req.body.priceSAR ? parseFloat(req.body.priceSAR) : null,
      isFree: req.body.isFree === "true",
      previewUrl: req.body.previewUrl,
      downloadUrl: req.body.downloadUrl,
      isActive: req.body.isActive === "true" || req.body.isActive === true,
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
    const levels = await listLevelsByCourse(parseInt(req.params.courseId, 10));
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
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      if (req.file) deleteFile(`/courselevel/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "معرّف المستوى غير صالح" });
    }

    const existingLevel = await getLevelById(id);
    if (!existingLevel) {
      if (req.file) deleteFile(`/courselevel/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "المستوى غير موجود" });
    }

    const data = {};

    if (req.body.order !== undefined) {
      data.order = parseInt(req.body.order, 10);
      data.name = `المستوى ${req.body.order}`;
    }

    if (req.body.description !== undefined) data.description = req.body.description;

    if (req.body.priceUSD !== undefined) data.priceUSD = req.body.priceUSD ? parseFloat(req.body.priceUSD) : null;

    if (req.body.priceSAR !== undefined) data.priceSAR = req.body.priceSAR ? parseFloat(req.body.priceSAR) : null;

    if (req.body.isFree !== undefined) data.isFree = req.body.isFree === "true" || req.body.isFree === true;

    if (req.body.previewUrl !== undefined) data.previewUrl = req.body.previewUrl;

    if (req.body.downloadUrl !== undefined) data.downloadUrl = req.body.downloadUrl;

    if (req.body.isActive !== undefined) data.isActive = req.body.isActive === "true" || req.body.isActive === true;

    //  التعامل مع الصورة الجديدة
    if (req.file) {
      // حذف القديمة إذا كانت موجودة
      if (existingLevel.imageUrl) deleteFile(existingLevel.imageUrl);
      data.imageUrl = `/uploads/images/courselevel/${req.file.filename}`;
    }

    const updated = await updateLevel(id, data);

    res.json({
      success: true,
      message: "تم تحديث المستوى بنجاح",
      data: serializeResponse(updated),
    });
  } catch (e) {
    // في حال الخطأ نحذف الصورة الجديدة لتجنب بقاء ملفات غير مستخدمة
    if (req.file) deleteFile(`/courselevel/${req.file.filename}`);
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};
export const adminToggleLevel = async (req, res, next) => {
  try {
    const level = await toggleLevel(parseInt(req.params.id, 10), !!req.body.isActive);
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
    const lessons = await listLessonsByLevel(parseInt(req.params.courseLevelId, 10));
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
    /*  const invalidFields = [];
      const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
      };
  */
    const youtubeUrl = (req.body.youtubeUrl ?? req.body.youtubeurl ?? '').trim();
    const googleDriveUrl = (req.body.googleDriveUrl ?? req.body.googledriveurl ?? '').trim();
    /*
        let ytDetail = null;
    
        if (youtubeUrl && isYouTubeUrl(youtubeUrl)) {
          const ytCheck = await checkYouTubeAvailability(youtubeUrl, { timeoutMs: 8000 });
          ytDetail = ytCheck;
          if (!ytCheck.available) invalidFields.push('youtubeUrl');
        }
    
        if (googleDriveUrl) {
          const gd = await checkUrl(googleDriveUrl, { timeoutMs: 8000, allowRedirects: true, headers: defaultHeaders });
          if (!gd.valid) invalidFields.push('googleDriveUrl');
        }
    
        if (invalidFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `روابط غير صالحة: ${invalidFields.join(', ')}`,
            data: { errors: invalidFields, youtube: ytDetail }
          });
        }*/


    const lesson = await createLessonForLevel(parseInt(req.params.courseLevelId, 10), {
      title: req.body.title,
      youtubeUrl,
      youtubeId: req.body.youtubeId,
      googleDriveUrl: googleDriveUrl || null,
      durationSec: req.body.durationSec ? Number(req.body.durationSec) : null,
      orderIndex: req.body.orderIndex ? Number(req.body.orderIndex) : 0,
      isFreePreview: !!req.body.isFreePreview
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء الدرس بنجاح",
      data: { ...serializeResponse(lesson) }
    });

  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminUpdateLesson = async (req, res, next) => {
  try {
    // Validate URLs if provided on update
    /*  const invalidFields = [];
      const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
      };
  */
    const youtubeUrl = (req.body.youtubeUrl ?? req.body.youtubeurl ?? '').trim();
    const googleDriveUrl = (req.body.googleDriveUrl ?? req.body.googledriveurl ?? '').trim();
    /*
        if (youtubeUrl) {
          let ytValid = false;
          if (isYouTubeUrl(youtubeUrl)) {
             const ytCheck = await checkYouTubeAvailability(youtubeUrl, { timeoutMs: 8000 });
             ytValid = ytCheck.available === true;
          } else {
            const yt = await checkUrl(youtubeUrl, { timeoutMs: 8000, allowRedirects: true, headers: defaultHeaders });
            ytValid = yt.valid;
          }
          if (!ytValid) invalidFields.push('youtubeUrl');
        }
    
        if (googleDriveUrl) {
          const gd = await checkUrl(googleDriveUrl, { timeoutMs: 8000, allowRedirects: true, headers: defaultHeaders });
          if (!gd.valid) invalidFields.push('googleDriveUrl');
        }
    
        if (invalidFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `روابط غير صالحة: ${invalidFields.join(', ')}`,
            data: { errors: invalidFields }
          });
        }*/

    const lesson = await updateLesson(parseInt(req.params.id, 10), {
      title: req.body.title,
      youtubeUrl: youtubeUrl || undefined,
      youtubeId: req.body.youtubeId ?? undefined,
      googleDriveUrl: googleDriveUrl || undefined,
      durationSec: req.body.durationSec !== undefined ? parseInt(req.body.durationSec, 10) : undefined,
      orderIndex: req.body.orderIndex !== undefined ? parseInt(req.body.orderIndex, 10) : undefined,
      isFreePreview: req.body.isFreePreview !== undefined ? !!req.body.isFreePreview : undefined
    });

    res.json({
      success: true,
      message: "تم تحديث الدرس بنجاح",
      data: {
        ...serializeResponse(lesson)
      }
    });

  } catch (e) {
    e.statusCode = e.statusCode || 400;
    next(e);
  }
};

export const adminToggleLesson = async (req, res, next) => {
  try {
    const lesson = await toggleLesson(parseInt(req.params.id, 10), !!req.body.isActive);
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
