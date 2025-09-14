import { serializeResponse } from "../utils/serialize.js";
import { 
  createDomain, listDomains, updateDomain, toggleDomain,
  createSubject, listSubjects, updateSubject, toggleSubject,
  createInstructor, listInstructors, updateInstructor, toggleInstructor,
  createCourse, updateCourse, toggleCourse, getCourseById, listCoursesPublic
} from "../services/catalog.service.js";

// Admin: Domains
export const adminCreateDomain = async (req, res, next) => {
  try {
    const { name } = req.body;
    const d = await createDomain(name);
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء المجال بنجاح",
      data: {
        ...serializeResponse(d)
      }
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminListDomains = async (req, res, next) => {
  try { 
    const list = await listDomains(); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة المجالات بنجاح",
      data: {
        ...serializeResponse(list)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateDomain = async (req, res, next) => {
  try { 
    const d = await updateDomain(parseInt(req.params.id,10), { name: req.body.name }); 
    res.json({ 
      success: true, 
      message: "تم تحديث المجال بنجاح",
      data: {
        ...serializeResponse(d)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleDomain = async (req, res, next) => {
  try { 
    const d = await toggleDomain(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل المجال بنجاح" : "تم تعطيل المجال بنجاح";
    res.json({ 
      success: true, 
      message,
      data: {
        ...serializeResponse(d)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

// Admin: Subjects
export const adminCreateSubject = async (req, res, next) => {
  try { 
    const s = await createSubject(req.body.name, parseInt(req.body.domainId,10)); 
    res.status(201).json({ 
      success: true, 
      message: "تم إنشاء الموضوع بنجاح",
      data: {
        ...serializeResponse(s)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminListSubjects = async (req, res, next) => {
  try { 
    const domainId = req.query.domainId ? parseInt(req.query.domainId,10): undefined; 
    const list = await listSubjects(domainId); 
    res.json({ 
      success: true, 
      message: "تم جلب قائمة المواضيع بنجاح",
      data: {
        ...serializeResponse(list)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateSubject = async (req, res, next) => {
  try { 
    const s = await updateSubject(parseInt(req.params.id,10), { name: req.body.name, domainId: req.body.domainId? parseInt(req.body.domainId,10): undefined }); 
    res.json({ 
      success: true, 
      message: "تم تحديث الموضوع بنجاح",
      data: {
        ...serializeResponse(s)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleSubject = async (req, res, next) => {
  try { 
    const s = await toggleSubject(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل الموضوع بنجاح" : "تم تعطيل الموضوع بنجاح";
    res.json({ 
      success: true, 
      data: {
        message,
        ...serializeResponse(s)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

// Admin: Instructors
export const adminCreateInstructor = async (req, res, next) => {
  try { 
    const i = await createInstructor({ name: req.body.name, bio: req.body.bio, avatarUrl: req.body.avatarUrl }); 
    res.status(201).json({ 
      success: true, 
      data: {
        message: "تم إنشاء المدرب بنجاح",
        ...serializeResponse(i)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminListInstructors = async (req, res, next) => {
  try { 
    const list = await listInstructors(); 
    res.json({ 
      success: true, 
      data: {
        message: "تم جلب قائمة المدربين بنجاح",
        ...serializeResponse(list)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateInstructor = async (req, res, next) => {
  try { 
    const i = await updateInstructor(parseInt(req.params.id,10), { name: req.body.name, bio: req.body.bio, avatarUrl: req.body.avatarUrl }); 
    res.json({ 
      success: true, 
      data: {
        message: "تم تحديث المدرب بنجاح",
        ...serializeResponse(i)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleInstructor = async (req, res, next) => {
  try { 
    const i = await toggleInstructor(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل المدرب بنجاح" : "تم تعطيل المدرب بنجاح";
    res.json({ 
      success: true, 
      data: {
        message,
        ...serializeResponse(i)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

// Admin: Courses
export const adminCreateCourse = async (req, res, next) => {
  try { 
    const c = await createCourse({
      title: req.body.title,
      description: req.body.description,
      priceUSD: req.body.priceUSD ? parseFloat(req.body.priceUSD) : null,
      priceSYP: req.body.priceSYP ? parseFloat(req.body.priceSYP) : null,
      promoVideoUrl: req.body.promoVideoUrl,
      levelCount: req.body.levelCount ? parseInt(req.body.levelCount,10): 0,
      subjectId: parseInt(req.body.subjectId,10),
      instructorId: parseInt(req.body.instructorId,10),
    });
    res.status(201).json({ 
      success: true, 
      data: {
        message: "تم إنشاء الكورس بنجاح",
        ...serializeResponse(c)
      }
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminUpdateCourse = async (req, res, next) => {
  try { 
    const id = parseInt(req.params.id,10); const data = { ...req.body };
    if (data.priceUSD!==undefined) data.priceUSD = data.priceUSD===null? null: parseFloat(data.priceUSD);
    if (data.priceSYP!==undefined) data.priceSYP = data.priceSYP===null? null: parseFloat(data.priceSYP);
    if (data.levelCount!==undefined) data.levelCount = parseInt(data.levelCount,10);
    if (data.subjectId!==undefined) data.subjectId = parseInt(data.subjectId,10);
    if (data.instructorId!==undefined) data.instructorId = parseInt(data.instructorId,10);
    const c = await updateCourse(id, data); 
    res.json({ 
      success: true, 
      data: {
        message: "تم تحديث الكورس بنجاح",
        ...serializeResponse(c)
      }
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
export const adminToggleCourse = async (req, res, next) => {
  try { 
    const c = await toggleCourse(parseInt(req.params.id,10), !!req.body.isActive); 
    const message = !!req.body.isActive ? "تم تفعيل الكورس بنجاح" : "تم تعطيل الكورس بنجاح";
    res.json({ 
      success: true, 
      data: {
        message,
        ...serializeResponse(c)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

// Public
export const publicListCourses = async (req, res, next) => {
  try {
    const skip = req.query.skip ? parseInt(req.query.skip,10): 0;
    const take = req.query.take ? parseInt(req.query.take,10): 20;
    const filters = {
      q: req.query.q || undefined,
      domainId: req.query.domainId ? parseInt(req.query.domainId,10): undefined,
      subjectId: req.query.subjectId ? parseInt(req.query.subjectId,10): undefined,
      instructorId: req.query.instructorId ? parseInt(req.query.instructorId,10): undefined,
    };
    const result = await listCoursesPublic(filters, skip, take);
    res.json({ 
      success: true, 
      data: {
        message: "تم جلب قائمة الكورسات بنجاح",
        ...serializeResponse(result)
      }
    });
  } catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};

export const publicGetCourse = async (req, res, next) => {
  try { 
    const c = await getCourseById(parseInt(req.params.id,10)); 
    if (!c || !c.isActive) return res.status(404).json({ 
      success: false, 
      data: { 
        message: "الكورس غير موجود" 
      }
    }); 
    res.json({ 
      success: true, 
      data: {
        message: "تم جلب الكورس بنجاح",
        ...serializeResponse(c)
      }
    }); 
  }
  catch (e) { e.statusCode = e.statusCode || 400; next(e); }
};
