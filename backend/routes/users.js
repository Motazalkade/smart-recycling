const express = require('express');
const { getAllUsers, updateUserRole, getUserStats } = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// الحصول على إحصائيات المستخدم
router.get('/stats', auth, getUserStats);

// الحصول على جميع المستخدمين (للمدراء فقط)
router.get('/all', auth, adminAuth, getAllUsers);

// تحديث دور المستخدم (للمدراء فقط)
router.patch('/:userId/role', auth, adminAuth, updateUserRole);

module.exports = router;