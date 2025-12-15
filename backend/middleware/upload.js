const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد uploads آمن (على Render يستخدم /tmp)
const getUploadsDir = () => {
  if (process.env.NODE_ENV === 'production') {
    // على Render، استخدم مساراً في /tmp
    const uploadsDir = '/tmp/recycling-uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 تم إنشاء مجلد uploads:', uploadsDir);
    }
    return uploadsDir;
  }
  
  // محلياً
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = getUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, 'recycling-' + uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // السماح بأنواع الصور فقط
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يسمح بالصور فقط (JPEG, PNG, GIF, WebP)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB كحد أقصى
    files: 1
  }
});

// دالة لخدمة الملفات بشكل آمن
const serveUploadedFile = (req, res, next) => {
  const filename = req.params.filename;
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    // تحديد نوع المحتوى بناءً على امتداد الملف
    const ext = path.extname(filename).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'الملف غير موجود' });
  }
};

module.exports = { upload, serveUploadedFile };