const { db } = require('../config/database');

// محاكاة نظام التعرف على الصور
const simulateRecognition = () => {
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
    const allLocations = db.all('SELECT * FROM recycling_locations');
    
    // تصفية المواقع حسب النوع أو العام
    const filteredLocations = allLocations.filter(location => 
      location.type === itemType || location.type === 'general'
    );
    
    if (filteredLocations.length === 0) return null;
    
    // حساب المسافات لجميع المواقع
    const locationsWithDistance = filteredLocations.map(location => {
      const distance = db.calculateDistance(userLat, userLng, location.latitude, location.longitude);
      return {
        ...location,
        distance: parseFloat(distance)
      };
    });
    
    // العثور على أقرب موقع
    const nearestLocation = locationsWithDistance.reduce((nearest, current) => {
      return current.distance < nearest.distance ? current : nearest;
    });
    
    return nearestLocation;
  } catch (error) {
    console.error('Error finding nearest location:', error);
    return null;
  }
};

const processRecyclingItem = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const imageFile = req.file;

    console.log('🔄 معالجة مادة جديدة:', { latitude, longitude, user: req.user.id });

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'الإحداثيات مطلوبة' });
    }

    // التعرف على المادة من الصورة (محاكاة)
    const recognitionResult = simulateRecognition();
    
    // العثور على أقرب موقع
    const nearestLocation = await findNearestLocation(latitude, longitude, recognitionResult.itemType);

    // حفظ المعلومات في قاعدة البيانات
    const result = db.run(
      `INSERT INTO recycling_items 
      (user_id, item_type, image_path, is_recyclable, nearest_location_id) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        recognitionResult.itemType,
        imageFile ? imageFile.filename : null,
        recognitionResult.isRecyclable ? 1 : 0,
        nearestLocation?.id || null
      ]
    );

    // إضافة نقاط للمستخدم إذا كانت المادة قابلة للتدوير
    if (recognitionResult.isRecyclable) {
      db.run('UPDATE users SET points = points + 10 WHERE id = ?', [req.user.id]);
    }

    const response = {
      itemType: recognitionResult.itemType,
      isRecyclable: recognitionResult.isRecyclable,
      confidence: recognitionResult.confidence,
      nearestLocation: nearestLocation,
      pointsEarned: recognitionResult.isRecyclable ? 10 : 0,
      message: imageFile ? 'تم معالجة الصورة بنجاح' : 'تم المحاكاة بدون صورة'
    };

    console.log('✅ تم معالجة المادة:', response);

    res.json(response);

  } catch (error) {
    console.error('❌ خطأ في معالجة المادة:', error);
    res.status(500).json({ message: 'خطأ في معالجة البيانات' });
  }
};

const getRecyclingLocations = (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    console.log('🗺️ جلب مواقع التدوير:', { lat, lng });
    
    // الحصول على جميع المواقع
    const locations = db.all('SELECT * FROM recycling_locations');
    
    // إذا كانت هناك إحداثيات، احسب المسافات
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      const locationsWithDistance = locations.map(location => {
        const distance = db.calculateDistance(userLat, userLng, location.latitude, location.longitude);
        return {
          ...location,
          distance: parseFloat(distance)
        };
      });
      
      // ترتيب حسب المسافة
      locationsWithDistance.sort((a, b) => a.distance - b.distance);
      console.log('✅ تم جلب المواقع مع المسافات:', locationsWithDistance.length);
      return res.json(locationsWithDistance);
    }
    
    console.log('✅ تم جلب جميع المواقع:', locations.length);
    res.json(locations);
  } catch (error) {
    console.error('❌ خطأ في جلب المواقع:', error);
    res.status(500).json({ message: 'خطأ في جلب المواقع' });
  }
};

const getUserHistory = (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📋 جلب سجل المستخدم:', userId);
    
    // الحصول على سجل المستخدم
    const userItems = db.all(
      `SELECT ri.*, rl.name as location_name, rl.address 
       FROM recycling_items ri 
       LEFT JOIN recycling_locations rl ON ri.nearest_location_id = rl.id 
       WHERE ri.user_id = ? 
       ORDER BY ri.created_at DESC`,
      [userId]
    );
    
    console.log('✅ تم جلب سجل المستخدم:', userItems.length, 'عناصر');
    res.json(userItems);
  } catch (error) {
    console.error('❌ خطأ في جلب السجل:', error);
    res.status(500).json({ message: 'خطأ في جلب السجل' });
  }
};

module.exports = {
  processRecyclingItem,
  getRecyclingLocations,
  getUserHistory,
  simulateRecognition,
  findNearestLocation
};