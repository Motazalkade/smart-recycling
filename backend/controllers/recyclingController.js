const { pool } = require('../config/database');

// محاكاة نظام التعرف على الصور
const recognizeItem = (imageBuffer) => {
  const recyclableItems = ['plastic_bottle', 'paper', 'glass', 'metal_can'];
  const nonRecyclableItems = ['plastic_bag', 'food_waste', 'styrofoam'];
  const allItems = [...recyclableItems, ...nonRecyclableItems];
  const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
  
  return {
    itemType: randomItem,
    isRecyclable: recyclableItems.includes(randomItem),
    confidence: Math.random() * 0.5 + 0.5
  };
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
  try {
    const { latitude, longitude } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: 'الصورة مطلوبة' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'الإحداثيات مطلوبة' });
    }

    // التعرف على المادة
    const recognitionResult = recognizeItem(imageFile.buffer);
    
    // العثور على أقرب موقع
    const nearestLocation = await findNearestLocation(
      latitude, 
      longitude, 
      recognitionResult.itemType
    );

    // حفظ المعلومات في قاعدة البيانات
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

    // إضافة نقاط للمستخدم إذا كانت المادة قابلة للتدوير
    if (recognitionResult.isRecyclable) {
      await pool.query(
        'UPDATE users SET points = points + 10 WHERE id = $1',
        [req.user.id]
      );
    }

    res.json({
      itemType: recognitionResult.itemType,
      isRecyclable: recognitionResult.isRecyclable,
      confidence: recognitionResult.confidence,
      nearestLocation: nearestLocation,
      pointsEarned: recognitionResult.isRecyclable ? 10 : 0,
      itemId: result.rows[0].id,
      createdAt: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'خطأ في معالجة الصورة' });
  }
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