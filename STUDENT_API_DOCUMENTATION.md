# 🎓 Taalam App - Student API Documentation

## 🌐 Base URL
```
http://localhost:5000
```

## 🔐 Authentication
معظم مسارات الطلاب تتطلب:
- **Authorization Header**: `Bearer {accessToken}`
- **Role**: `STUDENT`

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

# 🎟️ Coupon Routes

## الكوبونات (Coupons)

تتيح هذه المسارات التحقق من كوبون وتطبيقه على مستوى دورة محدد.

### 1. التحقق من الكوبون
**POST** `/api/coupons/validate`
*يتطلب مصادقة - طالب*

#### Request Body:
```json
{
  "code": "BACK2SCHOOL",
  "courseLevelId": 1
}
```

#### Response:
```json
{
  "success": true,
  "message": "الكوبون صالح.",
  "data": {
    "id": 12,
    "code": "BACK2SCHOOL",
    "discount": 20,
    "isPercent": true,
    "expiry": "2025-12-31",
    "maxUsage": 100,
    "usedCount": 5,
    "isActive": true
  }
}
```

### 2. تطبيق الكوبون
**POST** `/api/coupons/apply`
*يتطلب مصادقة - طالب*

> ملاحظة: تطبيق الكوبون سيزيد من `usedCount` بعد التحقق من الصلاحية. دمج الخصم مع عملية الدفع يتم في طبقة الشراء إن وُجدت.

#### Request Body:
```json
{
  "code": "BACK2SCHOOL",
  "courseLevelId": 1
}
```

#### Response:
```json
{
  "success": true,
  "message": "تم تطبيق الكوبون بنجاح.",
  "data": {
    "id": 12,
    "code": "BACK2SCHOOL",
    "usedCount": 6
  }
}
```

### رسائل أخطاء شائعة للكوبونات
```json
{"success": false, "message": "الكوبون غير صالح لهذا المستوى أو غير نشط."}
{"success": false, "message": "انتهت صلاحية هذا الكوبون."}
{"success": false, "message": "تم استهلاك الحد الأقصى لهذا الكوبون."}
```

# 🔑 Authentication Routes

## 1. تسجيل حساب جديد
**POST** `/api/auth/register`
*Content-Type: multipart/form-data*

### Request Body:
```json
{
  "phone": "+963933528477",
  "password": "StudentPass123",
  "name": "علي الطالب",
  "birthDate": "2000-03-20",
  "sex": "male",
  "avatar": [ملف الصورة - اختياري]
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "data": {
    "user": {
      "id": 10,
      "name": "علي الطالب",
      "phone": "+963933528477",
      "role": "STUDENT",
      "country": "Syria",
      "countryCode": "+963",
      "avatarUrl": "/uploads/avatars/avatar-123.jpg",
      "isVerified": true,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "session": {
      "id": "session-456",
      "expiresAt": "2024-01-15T15:00:00Z"
    }
  }
}
```

## 2. تسجيل الدخول
**POST** `/api/auth/login`

### Request Body:
```json
{
  "phone": "+963933528477",
  "password": "StudentPass123"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": 10,
      "name": "علي الطالب",
      "phone": "+963933528477",
      "role": "STUDENT",
      "country": "Syria",
      "avatarUrl": "/uploads/avatars/avatar-123.jpg"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
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

## 4. عرض الملف الشخصي
**GET** `/api/auth/profile`
*يتطلب مصادقة*

### Response:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "علي الطالب",
    "phone": "+963933528477",
    "role": "STUDENT",
    "country": "Syria",
    "countryCode": "+963",
    "avatarUrl": "/uploads/avatars/avatar-123.jpg",
    "birthDate": "2000-03-20T00:00:00Z",
    "sex": "male",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

## 5. تحديث الملف الشخصي
**PUT** `/api/auth/profile`
*يتطلب مصادقة - Content-Type: multipart/form-data*

### Request Body:
```json
{
  "name": "علي الطالب المحدث",
  "birthDate": "2000-03-20",
  "sex": "male",
  "avatar": [ملف الصورة الجديدة - اختياري]
}
```

## 6. تغيير كلمة المرور
**PUT** `/api/auth/change-password`
*يتطلب مصادقة*

### Request Body:
```json
{
  "currentPassword": "StudentPass123",
  "newPassword": "NewStudentPass456"
}
```

## 7. تسجيل الخروج
**POST** `/api/auth/logout`
*يتطلب مصادقة*

### Response:
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

# 📚 Course Catalog Routes

## استكشاف الدورات

### 1. عرض جميع الدورات المتاحة
**GET** `/api/catalog/courses?skip=0&take=10&q=البرمجة`

### Query Parameters:
- `skip`: رقم البداية للصفحات (افتراضي: 0)
- `take`: عدد العناصر في الصفحة (افتراضي: 10)
- `q`: البحث في عنوان الدورة (اختياري)

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
        "currency": "USD",
        "isFree": false,
        "hasAccess": false,
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
        "instructors": [
          {
            "instructor": {
              "id": 1,
              "name": "د. محمد أحمد",
              "bio": "خبير في البرمجة مع 10 سنوات خبرة"
            }
          }
        ]
      }
    ],
    "total": 1,
    "skip": 0,
    "take": 10
  }
}
```

### 2. عرض تفاصيل دورة محددة
**GET** `/api/catalog/courses/:id`
*يمكن الوصول إليها بدون مصادقة أو مع مصادقة*

### Response (بدون وصول):
```json
{
  "success": true,
  "message": "تم جلب تفاصيل الدورة بنجاح",
  "data": {
    "id": 1,
    "title": "دورة البرمجة الأساسية",
    "description": "تعلم أساسيات البرمجة من الصفر",
    "price": 299.99,
    "currency": "USD",
    "hasAccess": false,
    "lessons": [
      {
        "id": 1,
        "title": "مقدمة في البرمجة",
        "description": "درس تمهيدي",
        "youtubeUrl": "https://youtube.com/watch?v=abc123",
        "durationSec": 1800,
        "isFreePreview": true
      }
    ],
    "levels": [
      {
        "id": 1,
        "name": "المستوى الأول - الأساسيات",
        "order": 1
      }
    ],
    "subject": {
      "name": "البرمجة الأساسية",
      "specialization": {
        "name": "تطوير الويب",
        "domain": {
          "name": "التكنولوجيا والبرمجة"
        }
      }
    },
    "instructors": [
      {
        "instructor": {
          "name": "د. محمد أحمد",
          "bio": "خبير في البرمجة مع 10 سنوات خبرة"
        }
      }
    ]
  }
}
```

---

# 📝 Code Request Routes

## طلب أكواد الوصول

### 1. طلب كود وصول للدورة
**POST** `/api/code-requests`
*يتطلب مصادقة - طالب*

### Request Body:
```json
{
  "courseId": 1,
  "contact": "+963933528477"
}
```
 
### Response:
```json
{
  "success": true,
  "message": "تم إرسال طلب الكود بنجاح.",
  "data": {
    "id": 1,
    "courseId": 1,
    "status": "PENDING",
    "contact": "+963933528477",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. عرض طلبات الأكواد الخاصة بي
**GET** `/api/code-requests/my-requests`
*يتطلب مصادقة - طالب*

### Response:
```json
{
  "success": true,
  "message": "تم جلب طلبات الأكواد الخاصة بك بنجاح.",
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "contact": "+963933528477",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "course": {
        "id": 1,
        "title": "دورة البرمجة الأساسية"
      }
    },
    {
      "id": 2,
      "status": "APPROVED",
      "contact": "+963933528477",
      "createdAt": "2024-01-14T09:00:00Z",
      "updatedAt": "2024-01-14T11:00:00Z",
      "course": {
        "id": 2,
        "title": "دورة تطوير المواقع"
      }
    }
  ]
}
```

---

# 🎫 Access Code Routes

## تفعيل أكواد الوصول

### 1. تفعيل كود وصول لمستوى محدد
**POST** `/api/access-codes/activate/level/:courseLevelId`
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
  "message": "تم تفعيل الكود بنجاح! يمكنك الآن الوصول إلى دورة \"البرمجة الأساسية\".",
  "data": {
    "courseId": 1,
    "courseLevelId": 1,
    "expiresAt": "2024-07-15T10:00:00Z"
  }
}
```

### Error Response (كود غير صحيح):
```json
{
  "success": false,
  "message": "الكود غير صحيح أو منتهي الصلاحية"
}
```

### Error Response (كود مستخدم):
```json
{
  "success": false,
  "message": "هذا الكود تم استخدامه من قبل"
}
```

### Error Response (وصول موجود):
```json
{
  "success": false,
  "message": "أنت تملك وصولاً فعالاً لهذه الدورة بالفعل"
}
```

---

# 📈 Progress Tracking Routes

## تتبع التقدم

### 1. تسجيل إكمال درس
**POST** `/api/progress/lessons/:lessonId/complete`
*يتطلب مصادقة - طالب*

### Response:
```json
{
  "success": true,
  "message": "تم تحديث تقدمك بنجاح.",
  "data": {
    "lessonProgress": {
      "id": 1,
      "userId": 10,
      "lessonId": 1,
      "completed": true,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "courseProgress": {
      "id": 1,
      "userId": 10,
      "courseId": 1,
      "progress": 25.0,
      "completed": false,
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### Error Response (لا يوجد وصول):
```json
{
  "success": false,
  "message": "ليس لديك صلاحية الوصول لهذه الدورة"
}
```

### Error Response (درس غير موجود):
```json
{
  "success": false,
  "message": "الدرس غير موجود"
}
```

### 2. عرض تقدم الطالب في دورة
**GET** `/api/progress/courses/:courseId`
*يتطلب مصادقة - طالب*

### Response:
```json
{
  "success": true,
  "data": {
    "courseProgress": {
      "courseId": 1,
      "progress": 65.5,
      "completed": false,
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    "completedLessons": [
      {
        "lessonId": 1,
        "completed": true,
        "createdAt": "2024-01-15T09:00:00Z"
      },
      {
        "lessonId": 2,
        "completed": true,
        "createdAt": "2024-01-15T09:30:00Z"
      }
    ]
  }
}
```

---

# 📁 Files Routes

## ملفات المستوى

### 1. عرض ملفات مستوى محدد
**GET** `/api/files/levels/:id`
يتطلب مصادقة - دور: STUDENT

#### Parameters:
- `:id` معرف المستوى `courseLevelId`

#### Query Parameters:
- `page` اختياري، رقم الصفحة (افتراضي: 1)
- `limit` اختياري، عدد العناصر بالصفحة (افتراضي: 10)

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "key": "1700000000-123456789.pdf",
      "url": "/uploads/files/general/1700000000-123456789.pdf",
      "name": "ملف المراجعة.pdf",
      "type": "application/pdf",
      "size": 204800,
      "meta": { "note": "مرفق مراجعة" },
      "courseLevelId": 1,
      "createdAt": "2024-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

> ملاحظة: صلاحية عرض ملفات المستوى قد تعتمد على وجود وصول فعّال للمستوى.

### 2. عرض تفاصيل ملف
**GET** `/api/files/files/:id`
لا يتطلب مصادقة

#### Parameters:
- `:id` معرف الملف

#### Response:
```json
{
  "success": true,
  "data": {
    "id": 12,
    "key": "1700000000-123456789.pdf",
    "url": "/uploads/files/general/1700000000-123456789.pdf",
    "name": "ملف المراجعة.pdf",
    "type": "application/pdf",
    "size": 204800,
    "meta": { "note": "مرفق مراجعة" },
    "courseLevelId": 1,
    "createdAt": "2024-01-15"
  }
}
```

---

# 🎯 Quiz Routes

## الاختبارات

### 1. بدء اختبار
**GET** `/api/quizzes/:id/start`
*يتطلب مصادقة - طالب*

### Response:
```json
{
  "success": true,
  "message": "تم جلب الاختبار بنجاح.",
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
            "text": "أداة للتواصل مع الحاسوب"
          },
          {
            "id": 2,
            "text": "برنامج حاسوبي"
          },
          {
            "id": 3,
            "text": "نوع من أنواع الألعاب"
          },
          {
            "id": 4,
            "text": "تطبيق للهاتف"
          }
        ]
      },
      {
        "id": 2,
        "text": "ما هو المتغير في البرمجة؟",
        "order": 2,
        "options": [
          {
            "id": 5,
            "text": "مكان لتخزين البيانات"
          },
          {
            "id": 6,
            "text": "نوع من أنواع الملفات"
          },
          {
            "id": 7,
            "text": "برنامج للحاسوب"
          },
          {
            "id": 8,
            "text": "لغة برمجة"
          }
        ]
      }
    ]
  }
}
```

### Error Response (لا يوجد وصول):
```json
{
  "success": false,
  "message": "ليس لديك صلاحية الوصول لهذا الاختبار"
}
```

### Error Response (اختبار غير موجود):
```json
{
  "success": false,
  "message": "الاختبار غير موجود"
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
      "optionId": 1
    },
    {
      "questionId": 2,
      "optionId": 5
    }
  ]
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تقديم الاختبار بنجاح.",
  "data": {
    "id": 1,
    "userId": 10,
    "quizId": 1,
    "score": 85.5,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "wrongAnswers": 2,
    "passed": true,
    "passingScore": 70.0,
    "answers": [
      {
        "questionId": 1,
        "selectedOptionId": 1,
        "correctOptionId": 1,
        "isCorrect": true
      },
      {
        "questionId": 2,
        "selectedOptionId": 5,
        "correctOptionId": 5,
        "isCorrect": true
      }
    ],
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

---

# 🔐 OTP Verification Routes

## التحقق برمز OTP

### 1. طلب رمز التحقق
**POST** `/api/otp/request`

### Request Body:
```json
{
  "phone": "+963933528477"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق بنجاح",
  "data": {
    "phone": "+963933528477",
    "expiresAt": "2024-01-15T10:05:00Z",
    "attemptsLeft": 3
  }
}
```

### Error Response (تم تجاوز الحد الأقصى):
```json
{
  "success": false,
  "message": "تم تجاوز الحد الأقصى لطلبات OTP. حاول مرة أخرى بعد دقيقة."
}
```

### 2. التحقق من رمز OTP
**POST** `/api/otp/verify`

### Request Body:
```json
{
  "phone": "+963933528477",
  "code": "123456"
}
```

### Response:
```json
{
  "success": true,
  "message": "تم التحقق من الرمز بنجاح",
  "data": {
    "verified": true,
    "phone": "+963933528477"
  }
}
```

### Error Response (رمز خاطئ):
```json
{
  "success": false,
  "message": "رمز التحقق غير صحيح",
  "data": {
    "attemptsLeft": 2
  }
}
```

### Error Response (رمز منتهي الصلاحية):
```json
{
  "success": false,
  "message": "رمز التحقق منتهي الصلاحية"
}
```

---

# 📊 Common Use Cases

## حالات الاستخدام الشائعة

### 1. رحلة الطالب الكاملة

#### أ) التسجيل وتسجيل الدخول
```bash
# 1. تسجيل حساب جديد
curl -X POST http://localhost:5000/api/auth/register \
  -F "phone=+963933528477" \
  -F "password=StudentPass123" \
  -F "name=علي الطالب" \
  -F "birthDate=2000-03-20" \
  -F "sex=male" \
  -F "avatar=@avatar.jpg"

# 2. تسجيل الدخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+963933528477","password":"StudentPass123"}'
```

#### ب) استكشاف الدورات
```bash
# 3. عرض الدورات المتاحة
curl -X GET "http://localhost:5000/api/catalog/courses?skip=0&take=10"

# 4. عرض تفاصيل دورة محددة
curl -X GET http://localhost:5000/api/catalog/courses/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### ج) طلب الوصول
```bash
# 5. طلب كود وصول
curl -X POST http://localhost:5000/api/code-requests \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":1,"contact":"+963933528477"}'

# 6. تفعيل كود الوصول (بعد الحصول عليه)
curl -X POST http://localhost:5000/api/access-codes/activate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"ABC123XYZ"}'
```

#### د) التعلم والتقدم
```bash
# 7. تسجيل إكمال درس
curl -X POST http://localhost:5000/api/progress/lessons/1/complete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 8. عرض التقدم في الدورة
curl -X GET http://localhost:5000/api/progress/courses/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### هـ) أداء الاختبارات
```bash
# 9. بدء اختبار
curl -X GET http://localhost:5000/api/quizzes/1/start \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 10. تقديم إجابات الاختبار
curl -X POST http://localhost:5000/api/quizzes/1/submit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":1,"optionId":1},{"questionId":2,"optionId":5}]}'
```

### 2. إدارة الملف الشخصي
```bash
# تحديث الملف الشخصي
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=علي الطالب المحدث" \
  -F "avatar=@new_avatar.jpg"

# تغيير كلمة المرور
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"StudentPass123","newPassword":"NewStudentPass456"}'
```

---

# 📊 Error Codes

## أكواد الأخطاء الشائعة

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | طلب غير صحيح |
| 401 | Unauthorized | غير مصرح |
| 403 | Forbidden | ممنوع - لا يوجد وصول |
| 404 | Not Found | غير موجود |
| 409 | Conflict | تضارب في البيانات |
| 422 | Validation Error | خطأ في التحقق |
| 429 | Too Many Requests | تم تجاوز الحد الأقصى للطلبات |
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

### خطأ في الوصول:
```json
{
  "success": false,
  "message": "ليس لديك صلاحية الوصول لهذا المحتوى"
}
```

### خطأ في التوكن:
```json
{
  "success": false,
  "message": "التوكن منتهي الصلاحية"
}
```

---

# 🔐 Security Notes

## ملاحظات الأمان

1. **JWT Tokens**:
   - Access Token صالح لمدة 5 دقائق
   - Refresh Token صالح لمدة 10 دقائق
   - يجب تجديد التوكن قبل انتهاء صلاحيته

2. **Rate Limiting**:
   - محدود بـ 100 طلب في الدقيقة لكل IP
   - OTP محدود بـ 3 طلبات في الدقيقة

3. **Input Validation**:
   - جميع المدخلات يتم التحقق منها
   - حماية من XSS attacks

4. **File Upload**:
  - الصور (avatars/images): حد 5MB
  - ملفات عامة (صور/فيديو/PDF/Word): حد 50MB
  - الأنواع المسموحة للرفع العام: صور (image/*)، فيديو (video/*)، PDF (application/pdf)، Word (application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)

5. **Phone Validation**:
   - يتم التحقق من صحة رقم الهاتف
   - كشف الدولة تلقائياً
   - كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل
   - يجب أن تحتوي على أحرف وأرقام

---

# 📱 Mobile App Integration

## تكامل التطبيق المحمول

### Headers مطلوبة:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
User-Agent: TaalamApp/1.0 (iOS/Android)
```

### إدارة التوكن:
```javascript
// حفظ التوكن
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// استخدام التوكن
const token = localStorage.getItem('accessToken');
headers: {
  'Authorization': `Bearer ${token}`
}

// تجديد التوكن
if (response.status === 401) {
  const refreshToken = localStorage.getItem('refreshToken');
  // استدعاء API تجديد التوكن
}
```

### معالجة الأخطاء:
```javascript
try {
  const response = await fetch('/api/endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // معالجة الخطأ
}
```

### Response (مع وصول):
```json
{
  "success": true,
  "message": "تم جلب تفاصيل الدورة بنجاح",
  "data": {
    "id": 1,
    "title": "دورة البرمجة الأساسية",
    "description": "تعلم أساسيات البرمجة من الصفر",
    "price": 299.99,
    "hasAccess": true,
    "lessons": [
      {
        "id": 1,
        "title": "مقدمة في البرمجة",
        "description": "درس تمهيدي",
        "youtubeUrl": "https://youtube.com/watch?v=abc123",
        "youtubeId": "abc123",
        "durationSec": 1800,
        "orderIndex": 1,
        "isFreePreview": true
      },
      {
        "id": 2,
        "title": "المتغيرات والثوابت",
        "description": "تعلم كيفية استخدام المتغيرات",
        "youtubeUrl": "https://youtube.com/watch?v=def456",
        "youtubeId": "def456",
        "durationSec": 2400,
        "orderIndex": 2,
        "isFreePreview": false
      }
    ],
    "levels": [
      {
        "id": 1,
        "name": "المستوى الأول - الأساسيات",
        "order": 1
      }
    ]
  }
}
```
