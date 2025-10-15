# Admin Management API Documentation

## Overview
هذا الدليل يوضح كيفية استخدام APIs إدارة المشرفين في النظام.

## Authentication
جميع endpoints تتطلب:
- `Authorization: Bearer <access_token>`
- دور `ADMIN` فقط

## Endpoints

### 1. إنشاء مشرف جديد
```http
POST /api/admin/create-admin
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "+966501234567",
  "name": "أحمد محمد",
  "sex": "male",
  "birthDate": "1990-01-01",
  "role": "SUBADMIN",
  "username": "ahmed_admin",
  "email": "ahmed@example.com",
  "password": "123456",
  "expiresAt": "2025-12-31T23:59:59.000Z" // اختياري
}
```

### 2. عرض جميع المشرفين
```http
GET /api/admin/list?page=1&limit=10
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "تم جلب قائمة المشرفين بنجاح",
  "data": {
    "admins": [
      {
        "id": 1,
        "username": "ahmed_admin",
        "email": "ahmed@example.com",
        "user": {
          "id": 5,
          "name": "أحمد محمد",
          "phone": "+966501234567",
          "role": "SUBADMIN",
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 3. عرض مشرف محدد
```http
GET /api/admin/123
Authorization: Bearer <access_token>
```

### 4. تعديل بيانات مشرف
```http
PUT /api/admin/123
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "أحمد علي محمد",
  "username": "ahmed_new_username",
  "email": "ahmed_new@example.com",
  "password": "new_password_123",
  "phone": "+966509876543",
  "role": "ADMIN",
  "isActive": true
}
```

**ملاحظات:**
- جميع الحقول اختيارية
- يمكن تعديل حقل واحد أو أكثر
- سيتم التحقق من عدم تكرار البريد الإلكتروني واسم المستخدم ورقم الهاتف

### 5. حذف مشرف (Soft Delete)
```http
DELETE /api/admin/123
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "تم حذف المشرف بنجاح",
  "data": {
    "id": 1,
    "username": "ahmed_admin",
    "email": "ahmed@example.com"
  }
}
```

### 6. حذف مشرف نهائياً (Hard Delete)
```http
DELETE /api/admin/123/hard-delete
Authorization: Bearer <access_token>
```

**تحذير:** هذا الإجراء لا يمكن التراجع عنه!

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "البريد الإلكتروني مستخدم مسبقاً",
  "errors": []
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "غير مصرح لك بالوصول",
  "errors": []
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "صلاحيات غير كافية",
  "errors": []
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "المشرف غير موجود",
  "errors": []
}
```

## Validation Rules

### إنشاء مشرف جديد:
- `phone`: مطلوب، رقم هاتف صحيح
- `name`: اختياري، نص
- `sex`: اختياري، "male" أو "female"
- `birthDate`: اختياري، تاريخ صحيح
- `role`: اختياري، "ADMIN" أو "SUBADMIN"
- `username`: مطلوب، نص، أقل شيء 3 أحرف
- `email`: مطلوب، بريد إلكتروني صحيح
- `password`: مطلوب، نص، أقل شيء 6 أحرف

### تعديل مشرف:
- جميع الحقول اختيارية
- نفس قواعد التحقق للحقول المرسلة

### معاملات الاستعلام:
- `page`: اختياري، رقم صحيح موجب (افتراضي: 1)
- `limit`: اختياري، رقم بين 1-100 (افتراضي: 10)

## Security Notes

1. **الصلاحيات**: فقط المدير الرئيسي (`ADMIN`) يمكنه إدارة المشرفين
2. **كلمات المرور**: يتم تشفيرها تلقائياً قبل الحفظ
3. **الحذف الآمن**: الحذف العادي يقوم بإلغاء تفعيل الحساب فقط
4. **الحذف النهائي**: يحذف البيانات نهائياً من قاعدة البيانات

## Examples

### إنشاء مشرف فرعي:
```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966501234567",
    "name": "سارة أحمد",
    "sex": "female",
    "birthDate": "1992-05-15",
    "role": "SUBADMIN",
    "username": "sara_admin",
    "email": "sara@example.com",
    "password": "secure123"
  }'
```

### عرض المشرفين مع التصفح:
```bash
curl -X GET "http://localhost:3000/api/admin/list?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### تعديل بيانات مشرف:
```bash
curl -X PUT http://localhost:3000/api/admin/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "سارة علي أحمد",
    "email": "sara_new@example.com"
  }'
```
