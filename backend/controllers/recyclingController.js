const { db } = require('../config/database');

// محاكاة نظام التعرف على الصور
const recognizeItem = (imageBuffer) => {
  // في التطبيق الحقيقي، هنا نستخدم TensorFlow.js
  // لكن حالياً سنعود بقيمة عشوائية للمحاكاة
  const recyclableItems = ['plastic_bottle', 'paper', 'glass', 'metal_can'];
  const nonRecyclableItems = ['plastic_bag', 'food_waste', 'styrofoam'];
  
  const allItems = [...recyclableItems, ...nonRecyclableItems];
  const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
  
  return {
    itemType: randomItem,
    isRecyclable: recyclableItems.includes(randomItem),
    confidence: Math.random() * 0.5 + 0.5 // ثقة بين 0.5 و 1
  };
};

const findNearestLocation = (userLat, userLng, itemType) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT *, 
      (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
      cos(radians(longitude) - radians(?)) + 
      sin(radians(?)) * sin(radians(latitude)))) AS distance 
      FROM recycling_locations 
      WHERE type = ? OR type = 'general'
      ORDER BY distance ASC 
      LIMIT 1`,
      [userLat, userLng, userLat, itemType],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0] || null);
        }
      }
    );
  });
};

const processRecyclingItem = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: 'الصورة مطلوبة' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'الإحداثيات مطلوبة' });
    }

    // التعرف على المادة من الصورة
    const recognitionResult = recognizeItem(imageFile.buffer);
    
    // العثور على أقرب موقع
    const nearestLocation = await findNearestLocation(
      latitude, 
      longitude, 
      recognitionResult.itemType
    );

    // حفظ المعلومات في قاعدة البيانات
    db.run(
      `INSERT INTO recycling_items 
      (user_id, item_type, image_path, is_recyclable, nearest_location_id) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        recognitionResult.itemType,
        imageFile.filename,
        recognitionResult.isRecyclable ? 1 : 0,
        nearestLocation?.id || null
      ],
      function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'خطأ في حفظ البيانات' });
        }

        // إضافة نقاط للمستخدم إذا كانت المادة قابلة للتدوير
        if (recognitionResult.isRecyclable) {
          db.run(
            'UPDATE users SET points = points + 10 WHERE id = ?',
            [req.user.id]
          );
        }

        res.json({
          itemType: recognitionResult.itemType,
          isRecyclable: recognitionResult.isRecyclable,
          confidence: recognitionResult.confidence,
          nearestLocation: nearestLocation,
          pointsEarned: recognitionResult.isRecyclable ? 10 : 0
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في معالجة الصورة' });
  }
};

const getRecyclingLocations = (req, res) => {
  const { lat, lng } = req.query;

  let query = `SELECT * FROM recycling_locations`;
  let params = [];

  if (lat && lng) {
    query = `SELECT *, 
      (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
      cos(radians(longitude) - radians(?)) + 
      sin(radians(?)) * sin(radians(latitude)))) AS distance 
      FROM recycling_locations 
      ORDER BY distance ASC`;
    params = [lat, lng, lat];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في جلب البيانات' });
    }
    res.json(rows);
  });
};

const getUserHistory = (req, res) => {
  db.all(
    `SELECT ri.*, rl.name as location_name, rl.address 
     FROM recycling_items ri 
     LEFT JOIN recycling_locations rl ON ri.nearest_location_id = rl.id 
     WHERE ri.user_id = ? 
     ORDER BY ri.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في جلب السجل' });
      }
      res.json(rows);
    }
  );
};

module.exports = { processRecyclingItem, getRecyclingLocations, getUserHistory };