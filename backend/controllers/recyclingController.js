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
  console.log('🔄 === معالجة صورة جديدة ===');
  console.log('📝 Body:', req.body);
  console.log('📁 File:', req.file ? `نعم (${req.file.size} bytes)` : 'لا');
  console.log('👤 User ID:', req.user?.id || 'غير معروف');
  
  try {
    // تأخير محاكاة للمعالجة (2 ثانية)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // نتيجة محاكاة مباشرة
    const result = {
      itemType: 'plastic_bottle',
      itemName: 'زجاجة بلاستيكية',
      isRecyclable: true,
      confidence: 0.92,
      nearestLocation: {
        id: 1,
        name: 'جهاز إعادة تدوير البلاستيك - الرياض',
        address: 'الرياض، حي الملز',
        latitude: 24.7136,
        longitude: 46.6753,
        distance: '1.5 كم'
      },
      pointsEarned: 10,
      timestamp: new Date().toISOString(),
      debug: {
        hasFile: !!req.file,
        fileSize: req.file ? req.file.size : 0,
        userId: req.user?.id,
        backend: 'Render',
        status: 'success'
      }
    };
    
    console.log('✅ تم إنشاء النتيجة:', result);
    res.json(result);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    
    // حتى مع الخطأ، أعد نتيجة
    res.status(200).json({
      itemType: 'paper',
      isRecyclable: true,
      confidence: 0.85,
      nearestLocation: {
        id: 2,
        name: 'جهاز إعادة تدوير الورق - جدة',
        address: 'جدة، حي الصفا',
        latitude: 21.4858,
        longitude: 39.1925,
        distance: '3.2 كم'
      },
      pointsEarned: 10,
      emergencyMode: true,
      message: 'نظام الطوارئ يعمل'
    });
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