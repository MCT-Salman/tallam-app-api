# 🎓 Course Level Instructors API Documentation

## نظرة عامة

تم إضافة نظام جديد لربط المدربين بمستويات الدورات، مما يسمح بتعيين أكثر من مدرب لمستوى واحد، وإمكانية تدريس المدرب لأكثر من مستوى.

## 🗄️ قاعدة البيانات

### الجدول الوسطي الجديد: `CourseLevelInstructor`

```sql
CREATE TABLE CourseLevelInstructor (
  courseLevelId INT NOT NULL,
  instructorId INT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (courseLevelId, instructorId),
  FOREIGN KEY (courseLevelId) REFERENCES CourseLevel(id),
  FOREIGN KEY (instructorId) REFERENCES Instructor(id)
);
```

### العلاقات المحدثة:

- **Instructor**: يحتوي على `levels: CourseLevelInstructor[]`
- **CourseLevel**: يحتوي على `instructors: CourseLevelInstructor[]`

---

# 🛣️ API Endpoints

## 1. إضافة مدرب إلى مستوى دورة

**POST** `/api/lessons/admin/levels/:courseLevelId/instructors`
*يتطلب مصادقة - إدارة*

### Request Body:
```json
{
  "instructorId": 1
}
```

### Response:
```json
{
  "success": true,
  "message": "تم إضافة المدرب إلى المستوى بنجاح",
  "data": {
    "courseLevelId": 1,
    "instructorId": 1,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### Error Response (مدرب مُعيّن مسبقاً):
```json
{
  "success": false,
  "message": "المدرب مُعيّن لهذا المستوى بالفعل"
}
```

---

## 2. إزالة مدرب من مستوى دورة

**DELETE** `/api/lessons/admin/levels/:courseLevelId/instructors/:instructorId`
*يتطلب مصادقة - إدارة*

### Response:
```json
{
  "success": true,
  "message": "تم إزالة المدرب من المستوى بنجاح"
}
```

### Error Response (علاقة غير موجودة):
```json
{
  "success": false,
  "message": "المدرب غير مُعيّن لهذا المستوى"
}
```

---

## 3. تحديث مدربي مستوى دورة

**PUT** `/api/lessons/admin/levels/:courseLevelId/instructors`
*يتطلب مصادقة - إدارة*

### Request Body:
```json
{
  "instructorIds": [1, 2, 3]
}
```

### Response:
```json
{
  "success": true,
  "message": "تم تحديث مدربي المستوى بنجاح",
  "data": {
    "deleted": {
      "count": 2
    },
    "created": {
      "count": 3
    }
  }
}
```

---

## 4. عرض مدربي مستوى دورة

**GET** `/api/lessons/admin/levels/:courseLevelId/instructors`
*يتطلب مصادقة - إدارة*

### Response:
```json
{
  "success": true,
  "message": "تم جلب مدربي المستوى بنجاح",
  "data": [
    {
      "courseLevelId": 1,
      "instructorId": 1,
      "createdAt": "2024-01-15T10:00:00Z",
      "instructor": {
        "id": 1,
        "name": "أحمد محمد",
        "bio": "مدرب خبير في البرمجة",
        "avatarUrl": "https://example.com/avatar1.jpg",
        "isActive": true
      }
    },
    {
      "courseLevelId": 1,
      "instructorId": 2,
      "createdAt": "2024-01-15T11:00:00Z",
      "instructor": {
        "id": 2,
        "name": "فاطمة علي",
        "bio": "مدربة متخصصة في تطوير المواقع",
        "avatarUrl": "https://example.com/avatar2.jpg",
        "isActive": true
      }
    }
  ]
}
```

---

## 5. عرض مستويات الدورات لمدرب

**GET** `/api/lessons/admin/instructors/:instructorId/levels`
*يتطلب مصادقة - إدارة*

### Response:
```json
{
  "success": true,
  "message": "تم جلب مستويات المدرب بنجاح",
  "data": [
    {
      "courseLevelId": 1,
      "instructorId": 1,
      "createdAt": "2024-01-15T10:00:00Z",
      "courseLevel": {
        "id": 1,
        "name": "المستوى الأساسي",
        "order": 1,
        "courseId": 1,
        "isActive": true,
        "course": {
          "id": 1,
          "title": "دورة البرمجة الأساسية",
          "description": "تعلم أساسيات البرمجة"
        }
      }
    },
    {
      "courseLevelId": 3,
      "instructorId": 1,
      "createdAt": "2024-01-15T12:00:00Z",
      "courseLevel": {
        "id": 3,
        "name": "المستوى المتقدم",
        "order": 2,
        "courseId": 2,
        "isActive": true,
        "course": {
          "id": 2,
          "title": "دورة تطوير المواقع",
          "description": "تطوير مواقع احترافية"
        }
      }
    }
  ]
}
```

---

# 📊 التحديثات على الـ APIs الموجودة

## تحديث عرض مستويات الدورة

عند استدعاء `/api/lessons/courses/:courseId/levels`، ستتضمن الاستجابة الآن معلومات المدربين:

```json
{
  "success": true,
  "data": {
    "message": "تم جلب قائمة المستويات والدروس بنجاح",
    "levels": [
      {
        "id": 1,
        "name": "المستوى الأساسي",
        "order": 1,
        "courseId": 1,
        "isActive": true,
        "instructors": [
          {
            "courseLevelId": 1,
            "instructorId": 1,
            "createdAt": "2024-01-15T10:00:00Z",
            "instructor": {
              "id": 1,
              "name": "أحمد محمد",
              "bio": "مدرب خبير في البرمجة",
              "avatarUrl": "https://example.com/avatar1.jpg",
              "isActive": true
            }
          }
        ],
        "lessons": [
          {
            "id": 1,
            "title": "مقدمة في البرمجة",
            "youtubeUrl": "https://youtube.com/watch?v=abc123"
          }
        ]
      }
    ]
  }
}
```

---

# 🔧 أمثلة عملية

## إضافة مدرب إلى مستوى

```bash
curl -X POST http://localhost:5000/api/lessons/admin/levels/1/instructors \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"instructorId": 1}'
```

## تحديث مدربي مستوى

```bash
curl -X PUT http://localhost:5000/api/lessons/admin/levels/1/instructors \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"instructorIds": [1, 2, 3]}'
```

## عرض مدربي مستوى

```bash
curl -X GET http://localhost:5000/api/lessons/admin/levels/1/instructors \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## إزالة مدرب من مستوى

```bash
curl -X DELETE http://localhost:5000/api/lessons/admin/levels/1/instructors/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## عرض مستويات مدرب

```bash
curl -X GET http://localhost:5000/api/lessons/admin/instructors/1/levels \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

# 📋 قواعد التحقق

## إضافة مدرب:
- `instructorId`: مطلوب، رقم صحيح أكبر من 0

## تحديث مدربي المستوى:
- `instructorIds`: مصفوفة من الأرقام الصحيحة (يمكن أن تكون فارغة)

## معرفات المسارات:
- `courseLevelId`: رقم صحيح أكبر من 0
- `instructorId`: رقم صحيح أكبر من 0

---

# 🔐 الأمان

- جميع المسارات تتطلب مصادقة JWT
- الوصول محدود للإدارة فقط (ADMIN role)
- التحقق من صحة المعرفات قبل العمليات
- حماية من العمليات المكررة

---

# 💡 حالات الاستخدام

## 1. تعيين مدرب رئيسي ومساعد لمستوى:
```json
{
  "instructorIds": [1, 2]
}
```

## 2. تغيير المدرب المسؤول عن مستوى:
```json
{
  "instructorIds": [3]
}
```

## 3. إزالة جميع المدربين من مستوى:
```json
{
  "instructorIds": []
}
```

هذا النظام يوفر مرونة كاملة في إدارة المدربين لمستويات الدورات مع الحفاظ على سلامة البيانات والأمان.
