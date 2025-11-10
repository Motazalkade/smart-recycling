const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// إنشاء مجلدات إذا لم تكن موجودة
const uploadsDir = path.join(__dirname, 'uploads');
const databaseDir = path.join(__dirname, 'database');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recycling', require('./routes/recycling'));
app.use('/api/users', require('./routes/users'));

// Route للصحة
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'الخادم يعمل بشكل صحيح',
        timestamp: new Date().toISOString()
    });
});

// Route أساسي
app.get('/', (req, res) => {
    res.json({ 
        message: 'مرحباً بك في موقع إعادة التدوير الذكي',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            recycling: '/api/recycling', 
            users: '/api/users'
        }
    });
});

// Route لجميع المسارات غير المعرفة
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'الرابط غير موجود',
        path: req.originalUrl,
        availableEndpoints: ['/api/health', '/api/auth', '/api/recycling', '/api/users']
    });
});

// تهيئة قاعدة البيانات
const { initDatabase } = require('./config/database');

const startServer = async () => {
    try {
        console.log('🚀 بدء تشغيل الخادم...');
        await initDatabase();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
            console.log(`🌐 العنوان: http://localhost:${PORT}`);
            console.log(`🔍 اختبار الصحة: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ فشل في بدء الخادم:', error);
        process.exit(1);
    }
};

startServer();