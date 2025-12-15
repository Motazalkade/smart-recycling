const { pool } = require('../config/database');

// محاكاة نظام التعرف على الصور
// نظام تعرف محسن
const recognizeItem = (imageBuffer) => {
  console.log('🔍 تحليل الصورة (محاكاة)...');
  
  // محاكاة أكثر واقعية مع احتمالات مرجحة
  const items = [
    { type: 'plastic_bottle', name: 'زجاجة بلاستيكية', recyclable: true, weight: 0.4 },
    { type: 'paper', name: 'ورق', recyclable: true, weight: 0.3 },
    { type: 'glass', name: 'زجاج', recyclable: true, weight: 0.15 },
    { type: 'metal_can', name: 'علبة معدنية', recyclable: true, weight: 0.1 },
    { type: 'plastic_bag', name: 'كيس بلاستيكي', recyclable: false, weight: 0.03 },
    { type: 'food_waste', name: 'مخلفات طعام', recyclable: false, weight: 0.01 },
    { type: 'styrofoam', name: 'ستايروفوم', recyclable: false, weight: 0.01 }
  ];

  // اختيار عشوائي مرجح
  let random = Math.random();
  let selectedItem;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      selectedItem = item;
      break;
    }
  }

  // تأكد من وجود عنصر
  selectedItem = selectedItem || items[0];

  return {
    itemType: selectedItem.type,
    itemName: selectedItem.name,
    isRecyclable: selectedItem.recyclable,
    confidence: 0.7 + Math.random() * 0.25, // بين 0.7 و 0.95
    recyclingTips: getRecyclingTips(selectedItem.type)
  };
};

// نصائح إعادة التدوير
const getRecyclingTips = (itemType) => {
  const tips = {
    'plastic_bottle': ['اغسل الزجاجة قبل التدوير', 'أزل الغطاء والملصق', 'اضغطها لتقليل الحجم'],
    'paper': ['تأكد من خلو الورق من البقع', 'افصل الورق المقوى', 'أزل الدبابيس والمشابك'],
    'glass': ['اغسل العبوة جيداً', 'افصل الأغطية المعدنية', 'احذر من الزجاج المكسور'],
    'metal_can': ['اغسل العلبة المعدنية', 'اضغطها لتقليل الحجم', 'أزل الأجزاء البلاستيكية'],
    'plastic_bag': ['يمكن إعادة استخدامها', 'بعض المحلات تقبل تدوير الأكياس', 'استخدم أكياس قابلة لإعادة الاستخدام'],
    'default': ['تحقق من التعليمات المحلية', 'اغسل المادة إذا كانت متسخة', 'افصل المكونات المختلفة']
  };
  
  return tips[itemType] || tips.default;
};

const findNearestLocation = async (userLat, userLng, itemType) => {
  try {
    const result = await pool.query(
      `SELECT *, 
      (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
      cos(radians(longitude) - radians($2)) + 
      sin(radians($1)) * sin(radians(latitude)))) AS distance 
      FROM recycling_locations 
      WHERE type = $3 OR type = 'general'
      ORDER BY distance ASC 
      LIMIT 1`,
      [userLat, userLng, itemType]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding nearest location:', error);
    return null;
  }
};

const processRecyclingItem = async (req, res) => {
  console.log('📸 بدء معالجة الصورة...');
  
  try {
    const { latitude, longitude } = req.body;
    const imageFile = req.file;

    // تسجيل البيانات الواردة
    console.log('📥 بيانات الاستلام:', {
      hasFile: !!imageFile,
      fileSize: imageFile ? `${(imageFile.size / 1024).toFixed(2)}KB` : 'لا يوجد',
      fileName: imageFile ? imageFile.filename : 'لا يوجد',
      latitude,
      longitude,
      userId: req.user?.id
    });

    // التحقق من البيانات
    if (!imageFile) {
      console.log('❌ خطأ: لا توجد صورة');
      return res.status(400).json({ 
        message: 'الصورة مطلوبة',
        code: 'NO_IMAGE'
      });
    }

    if (!latitude || !longitude) {
      console.log('❌ خطأ: إحداثيات مفقودة');
      return res.status(400).json({ 
        message: 'الإحداثيات مطلوبة (خط الطول والعرض)',
        code: 'NO_COORDINATES'
      });
    }

    // 1. التعرف على المادة (محاكاة حالياً)
    console.log('🤖 التعرف على المادة...');
    const recognitionResult = recognizeItem(imageFile.buffer);
    console.log('✅ نتيجة التعرف:', recognitionResult);

    // 2. العثور على أقرب موقع
    console.log('🗺️ البحث عن أقرب موقع...');
    const nearestLocation = await findNearestLocation(
      parseFloat(latitude), 
      parseFloat(longitude), 
      recognitionResult.itemType
    );
    console.log('📍 أقرب موقع:', nearestLocation?.name || 'لا يوجد');

    // 3. حفظ المعلومات في قاعدة البيانات
    console.log('💾 حفظ البيانات في PostgreSQL...');
    const result = await pool.query(
      `INSERT INTO recycling_items 
      (user_id, item_type, image_path, is_recyclable, nearest_location_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, created_at`,
      [
        req.user.id,
        recognitionResult.itemType,
        imageFile.filename,
        recognitionResult.isRecyclable,
        nearestLocation?.id || null
      ]
    );

    const savedItem = result.rows[0];
    console.log('✅ تم حفظ العنصر:', savedItem.id);

    // 4. إضافة نقاط للمستخدم إذا كانت المادة قابلة للتدوير
    if (recognitionResult.isRecyclable) {
      await pool.query(
        'UPDATE users SET points = points + 10 WHERE id = $1 RETURNING points',
        [req.user.id]
      );
      console.log('⭐ تمت إضافة 10 نقاط للمستخدم');
    }

    // 5. إرجاع النتيجة
    const response = {
      success: true,
      itemType: recognitionResult.itemType,
      itemName: getArabicItemType(recognitionResult.itemType),
      isRecyclable: recognitionResult.isRecyclable,
      confidence: recognitionResult.confidence,
      nearestLocation: nearestLocation,
      pointsEarned: recognitionResult.isRecyclable ? 10 : 0,
      itemId: savedItem.id,
      imageUrl: `/uploads/${imageFile.filename}`,
      timestamp: savedItem.created_at,
      message: recognitionResult.isRecyclable 
        ? 'ممتاز! هذه المادة قابلة لإعادة التدوير!' 
        : 'للأسف هذه المادة غير قابلة للتدوير. حاول مع مادة أخرى.'
    };

    console.log('✅ معالجة الصورة اكتملت بنجاح:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ خطأ في معالجة الصورة:', error);
    console.error('تفاصيل الخطأ:', error.stack);
    
    // إرجاع خطأ مفصل
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ أثناء معالجة الصورة',
      error: process.env.NODE_ENV === 'development' ? error.message : 'خطأ داخلي',
      code: 'PROCESSING_ERROR'
    });
  }
};

// دالة مساعدة للترجمة
const getArabicItemType = (type) => {
  const types = {
    'plastic_bottle': 'زجاجة بلاستيكية',
    'paper': 'ورق',
    'glass': 'زجاج',
    'metal_can': 'علبة معدنية',
    'plastic_bag': 'كيس بلاستيكي',
    'food_waste': 'مخلفات طعام',
    'styrofoam': 'ستايروفوم'
  };
  return types[type] || type;
};

const getRecyclingLocations = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    let query = 'SELECT * FROM recycling_locations';
    let params = [];

    if (lat && lng) {
      query = `SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(latitude)))) AS distance 
        FROM recycling_locations 
        ORDER BY distance ASC`;
      params = [lat, lng];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ri.*, rl.name as location_name, rl.address 
       FROM recycling_items ri 
       LEFT JOIN recycling_locations rl ON ri.nearest_location_id = rl.id 
       WHERE ri.user_id = $1 
       ORDER BY ri.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ message: 'خطأ في جلب السجل' });
  }
};

module.exports = { processRecyclingItem, getRecyclingLocations, getUserHistory };