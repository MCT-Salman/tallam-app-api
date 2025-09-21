# 👨‍💼 Taalam App - Admin API Documentation

## 🌐 Base URL
```
http://localhost:5000
```

## 🔐 Authentication
جميع مسارات الإدارة تتطلب:
- **Authorization Header**: `Bearer {accessToken}`
- **Role**: `ADMIN` أو `SUBADMIN`

## 📋 Response Format
```json
{
  "success": true/false,
  "message": "رسالة باللغة العربية",
  "data": {
    // البيانات المطلوبة
  }
}
```

---

# 🔑 Authentication Routes

## 1. تسجيل دخول الإدارة
**POST** `/api/auth/login`

### Request Body:
```json
{
  "phone": "+963933528475",
  "password": "AdminPassword123"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": 1,
      "name": "أحمد الإدارة",
      "phone": "+963933528475",
      "role": "ADMIN",
      "country": "Syria"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "session": {
      "id": "session-123",
      "expiresAt": "2024-01-15T15:00:00Z"
    }
  }
}
```

## 2. تجديد التوكن
**POST** `/api/auth/refresh`

### Request Body:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تجديد التوكن بنجاح",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

# 🏗️ Content Management Routes

## المجالات (Domains)

### 1. إنشاء مجال جديد
**POST** `/api/catalog/admin/domains`

### Request Body:
```json
{
  "name": "التكنولوجيا والبرمجة"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء المجال بنجاح",
  "data": {
    "id": 1,
    "name": "التكنولوجيا والبرمجة",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض جميع المجالات
**GET** `/api/catalog/admin/domains`

### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "التكنولوجيا والبرمجة",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 3. تحديث مجال
**PUT** `/api/catalog/admin/domains/:id`

### Request Body:
```json
{
  "name": "التكنولوجيا والذكاء الاصطناعي"
}
```

### 4. تفعيل/إلغاء تفعيل مجال
**PUT** `/api/catalog/admin/domains/:id/active`

### Request Body:
```json
{
  "isActive": false
}
```

### 5. حذف مجال
**DELETE** `/api/catalog/admin/domains/:id`

---

## التخصصات (Specializations)

### 1. إنشاء تخصص جديد
**POST** `/api/catalog/admin/specializations`

### Request Body:
```json
{
  "name": "تطوير الويب",
  "domainId": 1
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء التخصص بنجاح",
  "data": {
    "id": 1,
    "name": "تطوير الويب",
    "domainId": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض جميع التخصصات
**GET** `/api/catalog/admin/specializations`

### 3. عرض تخصصات مجال محدد
**GET** `/api/catalog/admin/domains/:domainId/specializations`

### 4. تحديث تخصص
**PUT** `/api/catalog/admin/specializations/:id`

### 5. تفعيل/إلغاء تفعيل تخصص
**PUT** `/api/catalog/admin/specializations/:id/active`

### 6. حذف تخصص
**DELETE** `/api/catalog/admin/specializations/:id`

---

## المواد (Subjects)

### 1. إنشاء مادة جديدة
**POST** `/api/catalog/admin/subjects`

### Request Body:
```json
{
  "name": "البرمجة الأساسية",
  "specializationId": 1
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء المادة بنجاح",
  "data": {
    "id": 1,
    "name": "البرمجة الأساسية",
    "specializationId": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض جميع المواد
**GET** `/api/catalog/admin/subjects`

### 3. عرض مواد تخصص محدد
**GET** `/api/catalog/admin/specializations/:specializationId/subjects`

### 4. تحديث مادة
**PUT** `/api/catalog/admin/subjects/:id`

### 5. تفعيل/إلغاء تفعيل مادة
**PUT** `/api/catalog/admin/subjects/:id/active`

### 6. حذف مادة
**DELETE** `/api/catalog/admin/subjects/:id`

---

## المدربين (Instructors)

### 1. إنشاء مدرب جديد
**POST** `/api/catalog/admin/instructors`

### Request Body:
```json
{
  "name": "د. محمد أحمد",
  "bio": "خبير في البرمجة مع 10 سنوات خبرة",
  "avatarUrl": "https://example.com/avatar.jpg",
  "subjectId": 1
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء المدرب بنجاح",
  "data": {
    "id": 1,
    "name": "د. محمد أحمد",
    "bio": "خبير في البرمجة مع 10 سنوات خبرة",
    "avatarUrl": "https://example.com/avatar.jpg",
    "subjectId": 1,
    "subject": {
      "id": 1,
      "name": "البرمجة الأساسية"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض جميع المدربين
**GET** `/api/catalog/admin/instructors`

### 3. تحديث مدرب
**PUT** `/api/catalog/admin/instructors/:id`

### 4. تفعيل/إلغاء تفعيل مدرب
**PUT** `/api/catalog/admin/instructors/:id/active`

### 5. حذف مدرب
**DELETE** `/api/catalog/admin/instructors/:id`

---

## الدورات (Courses)

### 1. إنشاء دورة جديدة
**POST** `/api/catalog/admin/courses`

### Request Body:
```json
{
  "title": "دورة البرمجة الأساسية",
  "description": "تعلم أساسيات البرمجة من الصفر",
  "subjectId": 1
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء الدورة بنجاح",
  "data": {
    "id": 1,
    "title": "دورة البرمجة الأساسية",
    "description": "تعلم أساسيات البرمجة من الصفر",
    "price": 299.99,
    "currency": "USD",
    "isFree": false,
    "isActive": true,
    "subject": {
      "id": 1,
      "name": "البرمجة الأساسية",
      "specialization": {
        "id": 1,
        "name": "تطوير الويب",
        "domain": {
          "id": 1,
          "name": "التكنولوجيا والبرمجة"
        }
      }
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض جميع الدورات
**GET** `/api/catalog/admin/courses?skip=0&take=20&q=البرمجة`

### Response:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "دورة البرمجة الأساسية",
        "description": "تعلم أساسيات البرمجة من الصفر",
        "price": 299.99,
        "isActive": true,
        "subject": {
          "name": "البرمجة الأساسية"
        }
      }
    ],
    "total": 1,
    "skip": 0,
    "take": 20
  }
}
```

### 3. عرض دورة محددة
**GET** `/api/catalog/admin/courses/:id`

### 4. تحديث دورة
**PUT** `/api/catalog/admin/courses/:id`

### 5. تفعيل/إلغاء تفعيل دورة
**PUT** `/api/catalog/admin/courses/:id/active`

### 6. حذف دورة
**DELETE** `/api/catalog/admin/courses/:id`

---

# 📚 Lesson Management Routes

## مستويات الدورة (Course Levels)

### 1. إنشاء مستوى جديد
**POST** `/api/lessons/admin/courses/:courseId/levels`

### Request Body:
```json
{
  "title": "المستوى الأول - الأساسيات",
  "order": 1,
  "instructorId": 1
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء المستوى بنجاح",
  "data": {
    "id": 1,
    "name": "المستوى الأول - الأساسيات",
    "order": 1,
    "courseId": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض مستويات دورة
**GET** `/api/lessons/admin/courses/:courseId/levels`

### 3. تحديث مستوى
**PUT** `/api/lessons/admin/levels/:id`

### 4. تفعيل/إلغاء تفعيل مستوى
**PUT** `/api/lessons/admin/levels/:id/active`

### 5. حذف مستوى
**DELETE** `/api/lessons/admin/levels/:id`

---

## الدروس (Lessons)

### 1. إنشاء درس للدورة مباشرة
**POST** `/api/lessons/admin/courses/:courseId/lessons`

### Request Body:
```json
{
  "title": "مقدمة في البرمجة",
  "description": "درس تمهيدي عن البرمجة",
  "youtubeUrl": "https://youtube.com/watch?v=abc123",
  "youtubeId": "abc123",
  "durationSec": 1800,
  "orderIndex": 1,
  "isFreePreview": true
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء الدرس بنجاح",
  "data": {
    "id": 1,
    "title": "مقدمة في البرمجة",
    "description": "درس تمهيدي عن البرمجة",
    "youtubeUrl": "https://youtube.com/watch?v=abc123",
    "youtubeId": "abc123",
    "durationSec": 1800,
    "orderIndex": 1,
    "isFreePreview": true,
    "courseId": 1,
    "levelId": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. إنشاء درس لمستوى محدد
**POST** `/api/lessons/admin/levels/:courseLevelId/lessons`

### Request Body:
```json
{
  "title": "المتغيرات والثوابت",
  "description": "تعلم كيفية استخدام المتغيرات",
  "youtubeUrl": "https://youtube.com/watch?v=def456",
  "youtubeId": "def456",
  "durationSec": 2400,
  "orderIndex": 2,
  "isFreePreview": false
}
```

### 3. عرض دروس دورة
**GET** `/api/lessons/admin/courses/:courseId/lessons`

### 4. عرض دروس مستوى
**GET** `/api/lessons/admin/levels/:courseLevelId/lessons`

### 5. تحديث درس
**PUT** `/api/lessons/admin/lessons/:id`

### 6. تفعيل/إلغاء تفعيل درس
**PUT** `/api/lessons/admin/lessons/:id/active`

### 7. حذف درس
**DELETE** `/api/lessons/admin/lessons/:id`

---

# 🎯 Quiz Management Routes

## الاختبارات (Quizzes)

### 1. إنشاء اختبار للدورة
**POST** `/api/admin/courses/:courseId/quizzes`

### Request Body:
```json
{
  "title": "اختبار البرمجة الأساسية"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء الاختبار بنجاح",
  "data": {
    "id": 1,
    "title": "اختبار البرمجة الأساسية",
    "courseId": 1,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض اختبار دورة
**GET** `/api/admin/courses/:courseId/quizzes`

### 3. عرض اختبار محدد
**GET** `/api/admin/quizzes/:id`

### Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "اختبار البرمجة الأساسية",
    "courseId": 1,
    "questions": [
      {
        "id": 1,
        "text": "ما هي لغة البرمجة؟",
        "order": 1,
        "options": [
          {
            "id": 1,
            "text": "أداة للتواصل مع الحاسوب",
            "isCorrect": true
          },
          {
            "id": 2,
            "text": "برنامج حاسوبي",
            "isCorrect": false
          }
        ]
      }
    ]
  }
}
```

### 4. تحديث اختبار
**PUT** `/api/admin/quizzes/:id`

### 5. حذف اختبار
**DELETE** `/api/admin/quizzes/:id`

---

## الأسئلة (Questions)

### 1. إضافة سؤال للاختبار
**POST** `/api/admin/quizzes/:quizId/questions`

### Request Body:
```json
{
  "text": "ما هي لغة البرمجة؟",
  "order": 1,
  "options": [
    {
      "text": "أداة للتواصل مع الحاسوب",
      "isCorrect": true
    },
    {
      "text": "برنامج حاسوبي",
      "isCorrect": false
    },
    {
      "text": "نوع من أنواع الألعاب",
      "isCorrect": false
    },
    {
      "text": "تطبيق للهاتف",
      "isCorrect": false
    }
  ]
}
```

### Response:
```json
{
  "success": true,
  "message": "تمت إضافة السؤال بنجاح",
  "data": {
    "id": 1,
    "text": "ما هي لغة البرمجة؟",
    "order": 1,
    "quizId": 1,
    "options": [
      {
        "id": 1,
        "text": "أداة للتواصل مع الحاسوب",
        "isCorrect": true
      },
      {
        "id": 2,
        "text": "برنامج حاسوبي",
        "isCorrect": false
      }
    ]
  }
}
```

### 2. تحديث سؤال
**PUT** `/api/admin/questions/:id`

### 3. حذف سؤال
**DELETE** `/api/admin/questions/:id`

---

## خيارات الأسئلة (Options)

### 1. تحديث خيار
**PUT** `/api/admin/options/:id`

### Request Body:
```json
{
  "text": "أداة للتواصل مع الحاسوب بلغة مفهومة",
  "isCorrect": true
}
```

### 2. حذف خيار
**DELETE** `/api/admin/options/:id`

---

# 🎫 Access Code Management Routes

## أكواد الوصول (Access Codes)

### 1. إنشاء أكواد وصول
**POST** `/api/access-codes/admin/generate`
 
### Request Body:
```json
{
  "courseId": 1,
  "count": 50,
  "validityInMonths": 6
}
```

### Response:
```json
{
  "success": true,
  "message": "تم توليد 50 أكواد بنجاح.",
  "data": {
    "codes": [
      "ABC123XYZ",
      "DEF456UVW",
      "GHI789RST",
      "JKL012MNO",
      "PQR345STU"
    ]
  }
}
```

### 2. عرض أكواد دورة محددة
**GET** `/api/access-codes/admin/course/:courseId`

### Response:
```json
{
  "success": true,
  "message": "تم جلب أكواد الدورة بنجاح.",
  "data": [
    {
      "id": 1,
      "code": "ABC123XYZ",
      "courseId": 1,
      "issuedBy": 1,
      "issuedAt": "2024-01-15T10:00:00Z",
      "usedBy": null,
      "usedAt": null,
      "expiresAt": "2024-07-15T10:00:00Z",
      "isActive": true
    },
    {
      "id": 2,
      "code": "DEF456UVW",
      "courseId": 1,
      "issuedBy": 1,
      "issuedAt": "2024-01-15T10:00:00Z",
      "usedBy": 5,
      "usedAt": "2024-01-16T09:00:00Z",
      "expiresAt": "2024-07-15T10:00:00Z",
      "isActive": true
    }
  ]
}
```

---

# 📝 Code Request Management Routes

## طلبات الأكواد (Code Requests)

### 1. عرض جميع طلبات الأكواد
**GET** `/api/code-requests/admin?status=PENDING&skip=0&take=20`

### Query Parameters:
- `status`: PENDING, APPROVED, REJECTED (اختياري)
- `skip`: رقم البداية للصفحات (افتراضي: 0)
- `take`: عدد العناصر في الصفحة (افتراضي: 20)

### Response:
```json
{
  "success": true,
  "message": "تم جلب جميع طلبات الأكواد بنجاح.",
  "data": {
    "requests": [
      {
        "id": 1,
        "status": "PENDING",
        "contact": "+963933528477",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z",
        "user": {
          "id": 5,
          "name": "علي الطالب",
          "phone": "+963933528477"
        },
        "course": {
          "id": 1,
          "title": "دورة البرمجة الأساسية"
        }
      }
    ],
    "total": 1,
    "skip": 0,
    "take": 20
  }
}
```

### 2. تحديث حالة طلب الكود
**PATCH** `/api/code-requests/admin/:id/status`

### Request Body:
```json
{
  "status": "APPROVED"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تحديث حالة الطلب بنجاح.",
  "data": {
    "id": 1,
    "status": "APPROVED",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

# 👥 User Management Routes

## إدارة المستخدمين

### 1. عرض جميع المستخدمين
**GET** `/api/users?role=STUDENT&country=Syria&isActive=true&q=علي&skip=0&take=20`

### Query Parameters:
- `role`: STUDENT, ADMIN, SUBADMIN (اختياري)
- `country`: اسم الدولة (اختياري)
- `isActive`: true/false (اختياري)
- `q`: البحث في الاسم أو رقم الهاتف (اختياري)
- `skip`: رقم البداية للصفحات (افتراضي: 0)
- `take`: عدد العناصر في الصفحة (افتراضي: 20)

### Response:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 5,
        "name": "علي الطالب",
        "phone": "+963933528477",
        "role": "STUDENT",
        "country": "Syria",
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "take": 20
  }
}
```

### 2. إنشاء مستخدم جديد
**POST** `/api/users`

### Request Body:
```json
{
  "phone": "+963933528479",
  "password": "NewUserPass123",
  "name": "سارة الجديدة",
  "birthDate": "1995-08-20",
  "sex": "female",
  "role": "STUDENT",
  "isActive": true,
  "expiresAt": "2025-01-15T00:00:00Z"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء المستخدم بنجاح",
  "data": {
    "id": 10,
    "name": "سارة الجديدة",
    "phone": "+963933528479",
    "role": "STUDENT",
    "country": "Syria",
    "isActive": true,
    "isVerified": true,
    "expiresAt": "2025-01-15T00:00:00Z",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

### 3. عرض مستخدم محدد
**GET** `/api/users/:id`

### 4. تحديث مستخدم
**PUT** `/api/users/:id`

### 5. تفعيل/إلغاء تفعيل مستخدم
**PUT** `/api/users/:id/toggle-active`

### Request Body:
```json
{
  "isActive": false
}
```

### 6. حذف مستخدم
**DELETE** `/api/users/:id`

---

# 🔧 Admin Management Routes

## إدارة المدراء

### 1. إنشاء مدير فرعي
**POST** `/api/admin/create-subadmin`
*يتطلب صلاحية ADMIN فقط*

### Request Body:
```json
{
  "phone": "+963933528480",
  "password": "SubAdminPass123",
  "name": "سارة المساعدة",
  "birthDate": "1990-05-15"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء المدير الفرعي بنجاح",
  "data": {
    "id": 3,
    "name": "سارة المساعدة",
    "phone": "+963933528480",
    "role": "SUBADMIN",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2024-01-15T13:00:00Z"
  }
}
```

### 2. تغيير دور المستخدم
**PUT** `/api/admin/set-role`
*يتطلب صلاحية ADMIN فقط*

### Request Body:
```json
{
  "userId": 5,
  "role": "SUBADMIN"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تحديث دور المستخدم بنجاح",
  "data": {
    "id": 5,
    "name": "علي الطالب",
    "phone": "+963933528477",
    "role": "SUBADMIN",
    "isActive": true
  }
}
```

### 3. تفعيل/إلغاء تفعيل مستخدم
**PUT** `/api/admin/toggle-active`
*يتطلب صلاحية ADMIN فقط*

### Request Body:
```json
{
  "userId": 5,
  "isActive": false
}
```

---

# 📊 Error Codes

## أكواد الأخطاء الشائعة

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | طلب غير صحيح |
| 401 | Unauthorized | غير مصرح |
| 403 | Forbidden | ممنوع |
| 404 | Not Found | غير موجود |
| 409 | Conflict | تضارب في البيانات |
| 422 | Validation Error | خطأ في التحقق |
| 500 | Internal Server Error | خطأ في الخادم |

## أمثلة على رسائل الأخطاء

### خطأ في التحقق:
```json
{
  "success": false,
  "message": "خطأ في البيانات المدخلة",
  "errors": [
    {
      "field": "phone",
      "message": "رقم الهاتف غير صحيح"
    },
    {
      "field": "password",
      "message": "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"
    }
  ]
}
```

### خطأ في الصلاحيات:
```json
{
  "success": false,
  "message": "ليس لديك صلاحية للوصول لهذا المورد"
}
```

---

# 📝 Additional Notes

## Recent Updates
- **Instructors**: Now require `subjectId` for creation and updates. Instructors are directly associated with subjects.
- **Courses**: No longer require `instructorIds` as instructor assignment is handled at the level stage.
- **Levels**: Include `instructorId` to assign instructors to course levels.

## ملاحظات الأمان

1. **JWT Tokens**:
   - Access Token صالح لمدة 5 دقائق
   - Refresh Token صالح لمدة 10 دقائق

2. **Rate Limiting**:
   - محدود بـ 100 طلب في الدقيقة لكل IP

3. **Input Validation**:
   - جميع المدخلات يتم التحقق منها

4. **Role-based Access**:
   - ADMIN: صلاحيات كاملة
   - SUBADMIN: صلاحيات محدودة (لا يمكن إنشاء مدراء آخرين)

5. **Session Management**:
   - تتبع الجلسات النشطة
   - إمكانية إنهاء الجلسات عن بُعد
