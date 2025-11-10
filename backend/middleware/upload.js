// upload-basic.js - middleware بسيط لرفع الملفات
const path = require('path');
const fs = require('fs');

// إنشاء مجلد uploads إذا لم يكن موجوداً
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const handleFileUpload = (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next();
  }

  const file = req.files.image;
  const fileExt = path.extname(file.name);
  const fileName = 'recycling-' + Date.now() + fileExt;
  const filePath = path.join(uploadDir, fileName);

  // حفظ الملف
  file.mv(filePath, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return next();
    }
    
    req.file = {
      filename: fileName,
      path: filePath,
      size: file.size,
      mimetype: file.mimetype
    };
    next();
  });
};

module.exports = handleFileUpload;