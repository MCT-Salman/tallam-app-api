# 📚 Taalam App - API Documentation

## 🌐 Base URL
```
http://localhost:5000
```

## 📋 Response Format
جميع الاستجابات تتبع النمط التالي:

```json
{
  "success": true/false,
  "message": "رسالة باللغة العربية",
  "data": {
    // البيانات المطلوبة
  }
}
```

## 🔐 Authentication
يتم استخدام JWT Bearer Token في header:
```
Authorization: Bearer <access_token>
```

## 📱 Status Codes
- `200` - نجح الطلب
- `201` - تم الإنشاء بنجاح
- `400` - خطأ في البيانات المرسلة
- `401` - غير مصرح له
- `403` - ممنوع
- `404` - غير موجود
- `500` - خطأ في الخادم

---

# 🔑 Authentication Routes (`/api/auth`)

## 1. تسجيل مستخدم جديد
**POST** `/api/auth/register`

### Request Body (multipart/form-data):
```json
{
  "phone": "+963933528475",
  "password": "MyPassword123!",
  "name": "أحمد محمد",
  "birthDate": "1990-01-01",
  "sex": "ذكر",
  "avatar": "file" // اختياري
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تسجيل الحساب بنجاح",
  "data": {
    "user": {
      "id": 1,
      "phone": "+966501234567",
      "name": "أحمد محمد",
      "role": "STUDENT",
      "country": "Saudi Arabia",
      "countryCode": "+966"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "isVerified": true
  }
}
```

## 2. تسجيل الدخول
**POST** `/api/auth/login`

### Request Body:
```json
{
  "phone": "+966501234567",
  "password": "MyPassword123!"
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
      "phone": "+966501234567",
      "name": "أحمد محمد",
      "role": "STUDENT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "isVerified": true
  }
}
```

## 3. تجديد التوكن
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

## 4. الحصول على الملف الشخصي
**GET** `/api/auth/profile`
*يتطلب مصادقة*

### Response:
```json
{
  "success": true,
  "message": "تم جلب الملف الشخصي بنجاح",
  "data": {
    "id": 1,
    "phone": "+966501234567",
    "name": "أحمد محمد",
    "birthDate": "1990-01-01",
    "sex": "ذكر",
    "role": "STUDENT",
    "country": "Saudi Arabia",
    "countryCode": "+966",
    "avatarUrl": "http://localhost:5000/uploads/avatars/avatar.jpg"
  }
}
```

## 5. تحديث الملف الشخصي
**PUT** `/api/auth/profile`
*يتطلب مصادقة*

### Request Body (multipart/form-data):
```json
{
  "name": "أحمد علي",
  "birthDate": "1990-01-01",
  "sex": "ذكر",
  "newPassword": "NewPassword123!",
  "avatar": "file" // اختياري
}
```

## 6. تسجيل الخروج
**POST** `/api/auth/logout`
*يتطلب مصادقة*

### Response:
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح",
  "data": {}
}
```

## 7. تسجيل الخروج من جميع الأجهزة
**POST** `/api/auth/logout-all`
*يتطلب مصادقة*

## 8. عرض الجلسات النشطة
**GET** `/api/auth/sessions`
*يتطلب مصادقة*

## 9. إلغاء جلسة محددة
**DELETE** `/api/auth/sessions/:sessionId`
*يتطلب مصادقة*

---

# 📞 OTP Routes (`/api/otp`)

## 1. طلب رمز OTP
**POST** `/api/otp/request`

### Request Body:
```json
{
  "phone": "+966501234567"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق بنجاح",
  "data": {
    "isAlreadyVerified": false
  }
}
```

## 2. التحقق من رمز OTP
**POST** `/api/otp/verify`

### Request Body:
```json
{
  "phone": "+966501234567",
  "code": "123456"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم التحقق من الرمز بنجاح",
  "data": {}
}
```

---

# 📚 Catalog Routes (`/api/catalog`)

## 1. عرض جميع الدورات (عام)
**GET** `/api/catalog/courses`

### Query Parameters:
- `q` (string, optional): البحث في العنوان
- `domainId` (number, optional): فلترة حسب المجال
- `specializationId` (number, optional): فلترة حسب التخصص
- `subjectId` (number, optional): فلترة حسب المادة
- `skip` (number, optional): تخطي عدد من النتائج (للصفحات)
- `take` (number, optional): عدد النتائج المطلوبة (1-100)

### Response:
```json
{
  "success": true,
  "message": "تم جلب قائمة الدورات بنجاح",
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "دورة البرمجة الأساسية",
        "description": "تعلم أساسيات البرمجة",
        "price": 299.99,
        "currency": "USD",
        "isFree": false,
        "subject": {
          "id": 1,
          "name": "البرمجة",
          "specialization": {
            "id": 1,
            "name": "علوم الحاسوب",
            "domain": {
              "id": 1,
              "name": "التكنولوجيا"
            }
          }
        },
        "instructors": [
          {
            "instructor": {
              "id": 1,
              "name": "د. محمد أحمد",
              "bio": "خبير في البرمجة"
            }
          }
        ]
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

## 2. عرض دورة محددة (عام)
**GET** `/api/catalog/courses/:id`

### Response:
```json
{
  "success": true,
  "message": "تم جلب تفاصيل الدورة بنجاح",
  "data": {
    "id": 1,
    "title": "دورة البرمجة الأساسية",
    "description": "تعلم أساسيات البرمجة",
    "price": 299.99,
    "hasAccess": false,
    "lessons": [
      {
        "id": 1,
        "title": "مقدمة في البرمجة",
        "description": "درس تمهيدي",
        "youtubeUrl": "https://youtube.com/watch?v=...",
        "durationSec": 1800,
        "isFreePreview": true
      }
    ],
    "levels": [
      {
        "id": 1,
        "name": "المستوى الأول",
        "order": 1
      }
    ]
  }
}
```

---

# 🎯 Quiz Routes

## للطلاب (`/api/quizzes`)

### 1. بدء اختبار
**GET** `/api/quizzes/:id/start`
*يتطلب مصادقة - طالب*

### Response:
```json
{
  "success": true,
  "message": "تم جلب الاختبار بنجاح",
  "data": {
    "id": 1,
    "title": "اختبار البرمجة الأساسية",
    "questions": [
      {
        "id": 1,
        "text": "ما هي لغة البرمجة؟",
        "order": 1,
        "options": [
          {
            "id": 1,
            "text": "أداة للتواصل مع الحاسوب"
          },
          {
            "id": 2,
            "text": "برنامج حاسوبي"
          }
        ]
      }
    ]
  }
}
```

### 2. تقديم إجابات الاختبار
**POST** `/api/quizzes/:id/submit`
*يتطلب مصادقة - طالب*

### Request Body:
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionId": 1
    }
  ]
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تقديم الاختبار بنجاح",
  "data": {
    "score": 85.5,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "passed": true
  }
}
```

## للإدارة (`/api/admin`)

### 1. إنشاء اختبار جديد
**POST** `/api/admin/courses/:courseId/quizzes`
*يتطلب مصادقة - إدارة*

### Request Body:
```json
{
  "title": "اختبار البرمجة الأساسية"
}
```

### 2. إضافة سؤال للاختبار
**POST** `/api/admin/quizzes/:quizId/questions`
*يتطلب مصادقة - إدارة*

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
    }
  ]
}
```

---

# 📈 Progress Routes (`/api/progress`)

## 1. تسجيل إكمال درس
**POST** `/api/progress/lessons/:lessonId/complete`
*يتطلب مصادقة - طالب*

### Response:
```json
{
  "success": true,
  "message": "تم تسجيل إكمال الدرس بنجاح",
  "data": {}
}
```

## 2. عرض تقدم الطالب في دورة
**GET** `/api/progress/courses/:courseId`
*يتطلب مصادقة - طالب*

### Response:
```json
{
  "success": true,
  "message": "تم جلب تقدم الدورة بنجاح",
  "data": {
    "courseId": 1,
    "progress": 65.5,
    "completed": false,
    "completedLessons": 8,
    "totalLessons": 12,
    "quizScore": 85.0
  }
}
```

---

# 🎫 Access Code Routes (`/api/access-codes`)

## للطلاب

### 1. تفعيل كود وصول
**POST** `/api/access-codes/activate`
*يتطلب مصادقة - طالب*

### Request Body:
```json
{
  "code": "ABC123XYZ"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تفعيل الكود بنجاح",
  "data": {
    "course": {
      "id": 1,
      "title": "دورة البرمجة الأساسية"
    }
  }
}
```

## للإدارة

### 1. إنشاء أكواد وصول
**POST** `/api/access-codes/admin/generate`
*يتطلب مصادقة - إدارة*

### Request Body:
```json
{
  "courseId": 1,
  "count": 10,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء الأكواد بنجاح",
  "data": {
    "codes": ["ABC123", "DEF456", "GHI789"],
    "count": 3
  }
}
```

---

# 📝 Code Request Routes (`/api/code-requests`)

## للطلاب

### 1. طلب كود وصول
**POST** `/api/code-requests`
*يتطلب مصادقة - طالب*

### Request Body:
```json
{
  "courseId": 1,
  "contact": "+966501234567"
}
```

### 2. عرض طلباتي
**GET** `/api/code-requests/my-requests`
*يتطلب مصادقة - طالب*

## للإدارة

### 1. عرض جميع الطلبات
**GET** `/api/code-requests/admin`
*يتطلب مصادقة - إدارة*

### 2. تحديث حالة طلب
**PATCH** `/api/code-requests/admin/:id/status`
*يتطلب مصادقة - إدارة*

### Request Body:
```json
{
  "status": "APPROVED"
}
```

---

# 👥 User Management Routes (`/api/users`)
*جميع المسارات تتطلب صلاحيات إدارية*

### 1. عرض جميع المستخدمين
**GET** `/api/users`

### 2. إنشاء مستخدم جديد
**POST** `/api/users`

### 3. عرض مستخدم محدد
**GET** `/api/users/:id`

### 4. تحديث مستخدم
**PUT** `/api/users/:id`

### 5. حذف مستخدم
**DELETE** `/api/users/:id`

### 6. تفعيل/إلغاء تفعيل مستخدم
**PUT** `/api/users/:id/toggle-active`

# 🏫 Admin Catalog Management (`/api/catalog/admin`)
*جميع المسارات تتطلب صلاحيات إدارية*

## إدارة المجالات (Domains)

### 1. إنشاء مجال جديد
**POST** `/api/catalog/admin/domains`
 
### Request Body:
```json
{
  "name": "التكنولوجيا"
}
```

### 2. تحديث مجال
**PUT** `/api/catalog/admin/domains/:id`

### 3. تفعيل/إلغاء تفعيل مجال
**PUT** `/api/catalog/admin/domains/:id/active`

### Request Body:
```json
{
  "isActive": true
}
```

## إدارة التخصصات (Specializations)

### 1. إنشاء تخصص جديد
**POST** `/api/catalog/admin/specializations`

### Request Body:
```json
{
  "name": "علوم الحاسوب",
  "domainId": 1
}
```

## إدارة المواد (Subjects)

### 1. إنشاء مادة جديدة
**POST** `/api/catalog/admin/subjects`

### Request Body:
```json
{
  "name": "البرمجة",
  "specializationId": 1
}
```

## إدارة المدربين (Instructors)

### 1. إنشاء مدرب جديد
**POST** `/api/catalog/admin/instructors`

### Request Body:
```json
{
  "name": "د. محمد أحمد",
  "bio": "خبير في البرمجة مع 10 سنوات خبرة",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### 2. عرض جميع المدربين
**GET** `/api/catalog/admin/instructors`

### 3. تحديث مدرب
**PUT** `/api/catalog/admin/instructors/:id`

### 4. تفعيل/إلغاء تفعيل مدرب
**PUT** `/api/catalog/admin/instructors/:id/active`

## إدارة الدورات (Courses)

### 1. عرض جميع الدورات (للإدارة)
**GET** `/api/catalog/admin/courses`

### 2. إنشاء دورة جديدة
**POST** `/api/catalog/admin/courses`

### Request Body:
```json
{
  "title": "دورة البرمجة الأساسية",
  "description": "تعلم أساسيات البرمجة من الصفر",
  "price": 299.99,
  "currency": "USD",
  "isFree": false,
  "subjectId": 1,
  "instructorIds": [1, 2]
}
```

### 3. تحديث دورة
**PUT** `/api/catalog/admin/courses/:id`

### 4. تفعيل/إلغاء تفعيل دورة
**PUT** `/api/catalog/admin/courses/:id/active`

### 5. حذف دورة
**DELETE** `/api/catalog/admin/courses/:id`

---

# 📖 Lesson Management (`/api/lessons/admin`)

## إدارة المستويات (Course Levels)

### 1. إنشاء مستوى جديد
**POST** `/api/lessons/admin/courses/:courseId/levels`

### Request Body:
```json
{
  "name": "المستوى الأول",
  "order": 1
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

## إدارة الدروس (Lessons)

### 1. إنشاء درس في دورة
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

### 2. إنشاء درس في مستوى
**POST** `/api/lessons/admin/levels/:courseLevelId/lessons`

### 3. تحديث درس
**PUT** `/api/lessons/admin/lessons/:id`

### 4. تفعيل/إلغاء تفعيل درس
**PUT** `/api/lessons/admin/lessons/:id/active`

### 5. حذف درس
**DELETE** `/api/lessons/admin/lessons/:id`

## عرض المحتوى (عام)

### 1. عرض مستويات ودروس دورة
**GET** `/api/lessons/courses/:courseId/levels`

### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "المستوى الأول",
      "order": 1,
      "lessons": [
        {
          "id": 1,
          "title": "مقدمة في البرمجة",
          "description": "درس تمهيدي",
          "youtubeUrl": "https://youtube.com/watch?v=abc123",
          "durationSec": 1800,
          "isFreePreview": true
        }
      ]
    }
  ]
}
```

### 2. عرض دروس دورة (مسطح)
**GET** `/api/lessons/courses/:courseId/lessons`

---

# 🔧 Admin Routes (`/api/admin`)

## إدارة المشرفين

### 1. إنشاء مشرف فرعي
**POST** `/api/admin/create-subadmin`

### Request Body:
```json
{
  "phone": "+966501234567",
  "password": "AdminPass123!",
  "name": "أحمد المشرف",
  "birthDate": "1985-01-01"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء حساب المشرف الفرعي بنجاح",
  "data": {
    "id": 2,
    "phone": "+966501234567",
    "name": "أحمد المشرف",
    "role": "SUBADMIN",
    "isVerified": true,
    "isActive": true
  }
}
```

### 2. تغيير دور مستخدم
**PUT** `/api/admin/set-role`

### Request Body:
```json
{
  "userId": 1,
  "role": "SUBADMIN"
}
```

### 3. تفعيل/إلغاء تفعيل مستخدم
**PUT** `/api/admin/toggle-active`

### Request Body:
```json
{
  "userId": 1,
  "isActive": false
}
```

# 📁 Files Management Routes (`/api/files`)

## للإدارة (Admin Endpoints)

### 1. عرض جميع الملفات
**GET** `/api/files/admin/files`
*يتطلب مصادقة - إدارة*

#### Query Parameters:
- `page` (number, optional): رقم الصفحة (افتراضي: 1)
- `limit` (number, optional): عدد العناصر في الصفحة (افتراضي: 10)
- `courseLevelId` (number, optional): فلترة حسب مستوى الدورة

#### Response:
```json
{
  "success": true,
  "message": "تم جلب الملفات بنجاح",
  "data": [
    {
      "id": 1,
      "name": "دليل البرمجة.pdf",
      "url": "/uploads/files/general/دليل البرمجة.pdf",
      "type": "application/pdf",
      "size": 2048576,
      "courseLevel": {
        "id": 1,
        "name": "المستوى الأول"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### 2. رفع ملف جديد
**POST** `/api/files/admin/files`
*يتطلب مصادقة - إدارة*

#### Request Body (multipart/form-data):
```json
{
  "file": "file", // الملف المرفوع
  "courseLevelId": 1, // اختياري - ربط الملف بمستوى دورة
  "meta": "{\"description\": \"دليل البرمجة الأساسية\"}" // اختياري - بيانات إضافية JSON
}
```

#### Response:
```json
{
  "success": true,
  "message": "تم رفع الملف وإنشاؤه بنجاح",
  "data": {
    "id": 1,
    "name": "دليل البرمجة.pdf",
    "url": "/uploads/files/general/دليل البرمجة.pdf",
    "type": "application/pdf",
    "size": 2048576
  }
}
```

### 3. عرض ملف محدد
**GET** `/api/files/admin/files/:id`
*يتطلب مصادقة - إدارة*

#### Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "دليل البرمجة.pdf",
    "url": "/uploads/files/general/دليل البرمجة.pdf",
    "type": "application/pdf",
    "size": 2048576,
    "courseLevel": {
      "id": 1,
      "name": "المستوى الأول"
    }
  }
}
```

### 4. تحديث ملف
**PUT** `/api/files/admin/files/:id`
*يتطلب مصادقة - إدارة*

#### Request Body (multipart/form-data):
```json
{
  "file": "file", // اختياري - ملف جديد للاستبدال
  "name": "دليل البرمجة المحدث.pdf", // اختياري
  "courseLevelId": 2, // اختياري
  "meta": "{\"version\": \"2.0\"}" // اختياري
}
```

#### Response:
```json
{
  "success": true,
  "message": "تم تحديث الملف بنجاح",
  "data": {
    "id": 1,
    "name": "دليل البرمجة المحدث.pdf",
    "url": "/uploads/files/general/دليل البرمجة المحدث.pdf"
  }
}
```

### 5. حذف ملف
**DELETE** `/api/files/admin/files/:id`
*يتطلب مصادقة - إدارة*

#### Response:
```json
{
  "success": true,
  "message": "تم حذف الملف بنجاح"
}
```

## للطلاب (Public Endpoints)

### 1. عرض ملفات مستوى دورة
**GET** `/api/files/levels/:id`
*يتطلب مصادقة - طالب*

#### Query Parameters:
- `page` (number, optional): رقم الصفحة (افتراضي: 1)
- `limit` (number, optional): عدد العناصر في الصفحة (افتراضي: 10)

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "دليل البرمجة.pdf",
      "url": "/uploads/files/general/دليل البرمجة.pdf",
      "type": "application/pdf",
      "size": 2048576
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### 2. الوصول لملف محدد
**GET** `/api/files/file/:id`
*يتطلب مصادقة - طالب*

#### Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "دليل البرمجة.pdf",
    "url": "/uploads/files/general/دليل البرمجة.pdf",
    "type": "application/pdf",
    "size": 2048576
  }
}
```

---


### مثال على خطأ في التحقق من البيانات:
```json
{
  "success": false,
  "message": "رقم الهاتف مطلوب",
  "data": {}
}
```

### مثال على خطأ في المصادقة:
```json
{
  "success": false,
  "message": "ليس لديك الصلاحية",
  "data": {}
}
```

### مثال على خطأ انتهاء صلاحية التوكن:
```json
{
  "success": false,
  "message": "انتهت صلاحية الجلسة",
  "data": {
    "code": "TOKEN_EXPIRED"
  }
}
```

### مثال على خطأ في الخادم:
```json
{
  "success": false,
  "message": "خطأ في الخادم",
  "data": {}
}
```

---

# 📝 Validation Rules

## قواعد التحقق من رقم الهاتف:
- يجب أن يبدأ برمز الدولة (+)
- يجب أن يكون رقم هاتف صالح
- مثال: `+966501234567`

## قواعد كلمة المرور:
- 8 أحرف على الأقل
- حرف كبير واحد على الأقل
- حرف صغير واحد على الأقل
- رقم واحد على الأقل
- رمز خاص واحد على الأقل
- مثال: `MyPassword123!`

## قواعد التاريخ:
- يجب أن يكون بصيغة ISO 8601
- مثال: `1990-01-01` أو `2023-12-31T23:59:59Z`

## قواعد الجنس:
- القيم المقبولة: `"ذ"`, `"ا"`, `"أ"`, `"ذكر"`, `"انثى"`, `"أنثى"`

---

# 🔄 Rate Limiting

التطبيق يحتوي على حماية من الطلبات المتكررة:

- **OTP Requests**: 3 طلبات كحد أقصى خلال دقيقة واحدة
- **Login Attempts**: 5 محاولات فاشلة تؤدي لقفل الحساب لمدة 5 دقائق
- **General API**: حماية عامة من الطلبات المفرطة

---

# 📱 Phone Number Detection

التطبيق يدعم الكشف التلقائي عن الدولة من رقم الهاتف:

- يتم استخراج رمز الدولة تلقائياً
- يتم تحديد اسم الدولة
- يتم تطبيع الرقم للصيغة الدولية

مثال:
```
Input: +966501234567
Output: {
  "phone": "+966501234567",
  "country": "Saudi Arabia",
  "countryCode": "+966"
}
```

---

# 🔐 Security Features

## JWT Token Management
- **Access Token**: صالح لمدة 5 دقائق
- **Refresh Token**: صالح لمدة 10 دقائق
- **Session Management**: تتبع الجلسات النشطة
- **Device Tracking**: تسجيل معلومات الجهاز و IP

## Password Security
- تشفير كلمات المرور باستخدام bcrypt
- قواعد قوية لكلمات المرور
- إمكانية تغيير كلمة المرور

## XSS Protection
- تنظيف البيانات المدخلة من XSS
- استخدام helmet للحماية الإضافية

## CORS Configuration
- إعدادات CORS للتحكم في الوصول
- دعم للطلبات من النطاقات المصرح بها

---

# 📊 Database Schema Overview

## المستخدمون والمصادقة
- `User` - بيانات المستخدمين
- `Session` - الجلسات النشطة
- `RefreshToken` - رموز التجديد
- `LoginAttempt` - محاولات تسجيل الدخول
- `OtpCode` - رموز التحقق

## المحتوى التعليمي
- `Domain` - المجالات
- `Specialization` - التخصصات
- `Subject` - المواد
- `Course` - الدورات
- `CourseLevel` - مستويات الدورات
- `Lesson` - الدروس
- `Instructor` - المدربين

## الاختبارات والتقييم
- `Quiz` - الاختبارات
- `Question` - الأسئلة
- `Option` - خيارات الأسئلة
- `QuizResult` - نتائج الاختبارات

## التقدم والوصول
- `CourseProgress` - تقدم الطلاب في الدورات
- `LessonProgress` - تقدم الطلاب في الدروس
- `AccessCode` - أكواد الوصول
- `CodeRequest` - طلبات الأكواد

## الإشعارات والدعم
- `Notification` - الإشعارات
- `SupportMessage` - رسائل الدعم
- `Suggestion` - الاقتراحات
- `Review` - التقييمات

---

# 🚀 Getting Started

## 1. متطلبات النظام
- Node.js 18+
- MySQL 8.0+
- npm أو yarn

## 2. تثبيت المشروع
```bash
# استنساخ المشروع
git clone <repository-url>

# تثبيت التبعيات
npm install

# إعداد قاعدة البيانات
npm run migrate

# تشغيل الخادم
npm run dev
```

## 3. متغيرات البيئة
```env
PORT=5000
DATABASE_URL="mysql://user:password@localhost:3306/database"
JWT_SECRET="your-secret-key"
ACCESS_TOKEN_EXPIRES_IN="5m"
REFRESH_TOKEN_EXPIRES_IN="10m"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

## 4. أوامر مفيدة
```bash
# تشغيل الخادم في وضع التطوير
npm run dev

# تشغيل الخادم في وضع الإنتاج
npm start

# تطبيق migrations
npm run migrate

# إنشاء Prisma client
npm run generate

# فتح Prisma Studio
npm run studio
```

---

# 📋 API Testing Examples

## استخدام cURL

### تسجيل مستخدم جديد:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966501234567",
    "password": "MyPassword123!",
    "name": "أحمد محمد",
    "birthDate": "1990-01-01",
    "sex": "ذكر"
  }'
```

### تسجيل الدخول:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966501234567",
    "password": "MyPassword123!"
  }'
```

### الوصول لمسار محمي:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## استخدام JavaScript/Fetch

### تسجيل الدخول:
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+966501234567',
    password: 'MyPassword123!'
  })
});

const data = await response.json();
console.log(data);
```

### استخدام التوكن:
```javascript
const token = 'YOUR_ACCESS_TOKEN';

const response = await fetch('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await response.json();
console.log(profile);
```

---

# 🔍 Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `TOKEN_EXPIRED` | انتهت صلاحية الجلسة | يجب تجديد التوكن |
| `ACCOUNT_LOCKED` | تم قفل الحساب | تم تجاوز عدد محاولات تسجيل الدخول |
| `QUIZ_ALREADY_TAKEN` | لقد قمت بتقديم هذا الاختبار مسبقاً | لا يمكن إعادة الاختبار |
| `QUIZ_NO_ACCESS` | ليس لديك صلاحية الوصول لهذا الاختبار | يجب شراء الدورة أولاً |
| `ALREADY_REQUESTED_CODE` | لديك طلب قيد المراجعة لهذه الدورة بالفعل | انتظار موافقة الإدارة |

---

# 📞 Support & Contact

للحصول على الدعم الفني أو الاستفسارات:

- **Email**: support@taalam.app
- **Phone**: +966501234567
- **Documentation**: هذا الملف
- **API Version**: 1.0.0

---

# 📄 License

هذا المشروع مرخص تحت رخصة ISC. جميع الحقوق محفوظة لـ MCT.

---

*آخر تحديث: 2024*
