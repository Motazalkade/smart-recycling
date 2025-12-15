const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
// زيادة حجم الـ payload للصور
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// خدمة الملفات المرفوعة
const { serveUploadedFile } = require('./middleware/upload');
app.get('/uploads/:filename', serveUploadedFile);

// CORS شاملة
app.use(cors({
  origin: [
    'https://smart-recycling.netlify.app',
    'https://smart-recycling-o4et.onrender.com',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// معالجة طلبات OPTIONS
app.options('*', cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ==================== CORS إصلاح شامل لـ ====================
app.use(cors({
    origin: [
        'https://smart-recycling.netlify.app',
        'https://smart-recycling-o4et.onrender.com',
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Origin'
    ]
}));

// معالجة طلبات OPTIONS (preflight)
app.options('*', cors());

// ==================== Debugging Middleware ====================
app.use((req, res, next) => {
    console.log('🌐 Request:', {
        method: req.method,
        path: req.path,
        time: new Date().toISOString(),
        contentType: req.headers['content-type'],
        authHeader: req.headers['authorization'] ? 'Present' : 'Missing',
        userAgent: req.headers['user-agent']
    });
    next();
});

// ==================== Middleware الأساسي ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== إنشاء المجلدات ====================
const uploadsDir = path.join(__dirname, 'uploads');
const databaseDir = path.join(__dirname, 'database');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 تم إنشاء مجلد uploads:', uploadsDir);
}

if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
    console.log('📁 تم إنشاء مجلد database:', databaseDir);
}

// ==================== Routes للتحميل والملفات الثابتة ====================
app.use('/uploads', express.static(uploadsDir));

// ==================== Route اختبار بدون مصادقة ====================
app.post('/api/test/process', (req, res) => {
    console.log('🧪 Test endpoint hit!', req.body);

    const mockResult = {
        itemType: 'plastic_bottle',
        isRecyclable: true,
        confidence: 0.95,
        nearestLocation: {
            id: 1,
            name: 'جهاز اختبار - الرياض',
            address: 'موقع اختباري',
            latitude: 24.7136,
            longitude: 46.6753,
            distance: '1.2'
        },
        pointsEarned: 10,
        message: '✅ اختبار ناجح! النظام يعمل',
        timestamp: new Date().toISOString()
    };

    res.json(mockResult);
});

// ==================== Routes الأساسية ====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recycling', require('./routes/recycling'));
app.use('/api/users', require('./routes/users'));

// ==================== Route للصحة ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'الخادم يعمل بشكل صحيح',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        endpoints: {
            health: '/api/health',
            test: '/api/test/process',
            auth: '/api/auth',
            recycling: '/api/recycling',
            users: '/api/users'
        }
    });
});

// ==================== Route أساسي للصفحة الرئيسية ====================
app.get('/', (req, res) => {
    res.json({
        message: 'مرحباً بك في موقع إعادة التدوير الذكي',
        version: '2.0.0',
        status: 'operational',
        frontend_url: 'https://smart-recycling.netlify.app',
        api_docs: {
            health: '/api/health',
            test_endpoint: '/api/test/process (POST)',
            auth: '/api/auth',
            recycling: '/api/recycling',
            users: '/api/users'
        }
    });
});

// ==================== Route لجميع المسارات غير المعرفة ====================
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'الرابط غير موجود',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            '/api/health',
            '/api/test/process',
            '/api/auth',
            '/api/recycling',
            '/api/users'
        ],
        help: 'استخدم /api/health للتحقق من حالة الخادم'
    });
});

// ==================== معالجة الأخطاء ====================
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);

    res.status(err.status || 500).json({
        error: 'خطأ في الخادم',
        message: err.message || 'حدث خطأ غير متوقع',
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// ==================== تهيئة قاعدة البيانات وبدء الخادم ====================
const { initDatabase } = require('./config/database');

const startServer = async () => {
    try {
        console.log('🚀 بدء تشغيل الخادم...');
        await initDatabase();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
            console.log(`🌐 العنوان المحلي: http://localhost:${PORT}`);
            console.log(`🌐 العنوان العام: https://smart-recycling-o4et.onrender.com`);
            console.log(`🔍 اختبار الصحة: https://smart-recycling-o4et.onrender.com/api/health`);
            console.log(`🧪 اختبار المعالجة: POST https://smart-recycling-o4et.onrender.com/api/test/process`);
            console.log(`📱 Frontend: https://smart-recycling.netlify.app`);
        });
    } catch (error) {
        console.error('❌ فشل في بدء الخادم:', error);
        process.exit(1);
    }
};

startServer();




           
          