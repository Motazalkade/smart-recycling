// upload-basic.js - middleware مبسط لمعالجة الصور
const path = require('path');
const fs = require('fs');

const handleFileUpload = (req, res, next) => {
  // إذا لم يكن هناك ملف، انتقل للخطوة التالية
  if (!req.body.image || typeof req.body.image !== 'string') {
    return next();
  }

  try {
    // معالجة base64 image
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // إنشاء اسم فريد للملف
    const fileName = `recycling-${Date.now()}.jpg`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    
    // حفظ الملف
    fs.writeFileSync(filePath, buffer);
    
    // إضافة معلومات الملف للطلب
    req.file = {
      filename: fileName,
      path: filePath,
      size: buffer.length,
      mimetype: 'image/jpeg'
    };
    
    next();
  } catch (error) {
    console.error('Error processing image:', error);
    next();
  }
};

module.exports = handleFileUpload;