// Test file for Admin Management APIs
// يمكن تشغيل هذه الاختبارات باستخدام Jest أو أي framework اختبار آخر

import request from 'supertest';
import app from '../app.js';

describe('Admin Management APIs', () => {
  let adminToken;
  let createdAdminId;

  // Setup: تسجيل دخول المدير الرئيسي للحصول على token
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/admin/login')
      .send({
        identifier: 'admin@example.com', // يجب تعديل هذا حسب بيانات المدير الرئيسي
        password: 'admin_password'
      });

    adminToken = loginResponse.body.data.accessToken;
  });

  describe('POST /api/admin/create-admin', () => {
    test('should create new admin successfully', async () => {
      const newAdmin = {
        phone: '+966501234567',
        name: 'أحمد محمد',
        sex: 'male',
        birthDate: '1990-01-01',
        role: 'SUBADMIN',
        username: 'ahmed_test_admin',
        email: 'ahmed_test@example.com',
        password: 'test123456'
      };

      const response = await request(app)
        .post('/api/admin/create-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAdmin);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(newAdmin.name);
      expect(response.body.data.admin.username).toBe(newAdmin.username);
      expect(response.body.data.admin.email).toBe(newAdmin.email);

      createdAdminId = response.body.data.admin.id;
    });

    test('should fail with duplicate email', async () => {
      const duplicateAdmin = {
        phone: '+966509876543',
        name: 'محمد أحمد',
        username: 'mohammed_admin',
        email: 'ahmed_test@example.com', // نفس البريد المستخدم سابقاً
        password: 'test123456'
      };

      const response = await request(app)
        .post('/api/admin/create-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateAdmin);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('البريد الإلكتروني مستخدم مسبقاً');
    });
  });

  describe('GET /api/admin/list', () => {
    test('should get admins list with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/list?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.admins).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/admin/:id', () => {
    test('should get specific admin by ID', async () => {
      const response = await request(app)
        .get(`/api/admin/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdAdminId);
      expect(response.body.data.username).toBe('ahmed_test_admin');
    });

    test('should return 404 for non-existent admin', async () => {
      const response = await request(app)
        .get('/api/admin/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/:id', () => {
    test('should update admin information', async () => {
      const updateData = {
        name: 'أحمد علي محمد',
        username: 'ahmed_updated_admin',
        email: 'ahmed_updated@example.com'
      };

      const response = await request(app)
        .put(`/api/admin/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.username).toBe(updateData.username);
      expect(response.body.data.email).toBe(updateData.email);
    });

    test('should fail with duplicate username', async () => {
      // إنشاء مشرف آخر أولاً
      const anotherAdmin = {
        phone: '+966507777777',
        name: 'سارة أحمد',
        username: 'sara_admin',
        email: 'sara@example.com',
        password: 'test123456'
      };

      await request(app)
        .post('/api/admin/create-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(anotherAdmin);

      // محاولة تحديث المشرف الأول باسم مستخدم المشرف الثاني
      const response = await request(app)
        .put(`/api/admin/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'sara_admin' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('اسم المستخدم مستخدم مسبقاً');
    });
  });

  describe('DELETE /api/admin/:id', () => {
    test('should soft delete admin', async () => {
      const response = await request(app)
        .delete(`/api/admin/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم حذف المشرف بنجاح');

      // التحقق من أن المشرف تم إلغاء تفعيله وليس حذفه نهائياً
      const getResponse = await request(app)
        .get(`/api/admin/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.body.data.user.isActive).toBe(false);
    });
  });

  describe('DELETE /api/admin/:id/hard-delete', () => {
    test('should permanently delete admin', async () => {
      const response = await request(app)
        .delete(`/api/admin/${createdAdminId}/hard-delete`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم حذف المشرف نهائياً من النظام');

      // التحقق من أن المشرف تم حذفه نهائياً
      const getResponse = await request(app)
        .get(`/api/admin/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Authorization Tests', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/list');

      expect(response.status).toBe(401);
    });

    test('should require ADMIN role', async () => {
      // محاولة الوصول بـ token مستخدم عادي (إذا كان متوفراً)
      const response = await request(app)
        .get('/api/admin/list')
        .set('Authorization', 'Bearer invalid_or_student_token');

      expect(response.status).toBe(401);
    });
  });
});

// Helper functions for testing
export const createTestAdmin = async (adminToken, adminData) => {
  const response = await request(app)
    .post('/api/admin/create-admin')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(adminData);
  
  return response.body.data;
};

export const deleteTestAdmin = async (adminToken, adminId) => {
  await request(app)
    .delete(`/api/admin/${adminId}/hard-delete`)
    .set('Authorization', `Bearer ${adminToken}`);
};
