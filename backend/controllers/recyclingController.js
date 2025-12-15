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
  console.log('🎯 === بدء معالجة طلب جديد ===');
  console.log('📦 Request Body:', req.body);
  console.log('📁 File:', req.file ? {
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'لا يوجد ملف');
  console.log('👤 User:', req.user?.id);
  
  try {
    // تأخير بسيط لمحاكاة المعالجة
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // أنواع المواد
    const materials = [
      { type: 'plastic_bottle', name: 'زجاجة بلاستيكية', recyclable: true },
      { type: 'paper', name: 'ورق', recyclable: true },
      { type: 'glass', name: 'زجاج', recyclable: true },
      { type: 'metal_can', name: 'علبة معدنية', recyclable: true },
      { type: 'plastic_bag', name: 'كيس بلاستيكي', recyclable: false }
    ];
    
    // اختيار مادة عشوائية
    const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
    
    // المواقع المتاحة
    const locations = [
      { id: 1, name: 'جهاز إعادة تدوير البلاستيك - الرياض', address: 'الرياض، حي الملز', lat: 24.7136, lng: 46.6753, type: 'plastic' },
      { id: 2, name: 'جهاز إعادة تدوير الورق - جدة', address: 'جدة، حي الصفا', lat: 21.4858, lng: 39.1925, type: 'paper' },
      { id: 3, name: 'جهاز إعادة تدوير الزجاج - الرياض', address: 'الرياض، حي العليا', lat: 24.7616, lng: 46.673, type: 'glass' }
    ];
    
    // العثور على موقع مناسب
    const suitableLocation = locations.find(loc => loc.type === randomMaterial.type) || locations[0];
    
    // حساب مسافة عشوائية
    const distance = (Math.random() * 5 + 0.5).toFixed(1);
    
    // إنشاء النتيجة
    const result = {
      itemType: randomMaterial.type,
      itemName: randomMaterial.name,
      isRecyclable: randomMaterial.recyclable,
      confidence: 0.85 + (Math.random() * 0.1), // بين 0.85 و 0.95
      nearestLocation: {
        id: suitableLocation.id,
        name: suitableLocation.name,
        address: suitableLocation.address,
        latitude: suitableLocation.lat,
        longitude: suitableLocation.lng,
        distance: `${distance} كم`,
        type: suitableLocation.type
      },
      pointsEarned: randomMaterial.recyclable ? 10 : 0,
      timestamp: new Date().toISOString(),
      processingTime: '1.5 ثانية',
      debug: {
        hasFile: !!req.file,
        fileSize: req.file?.size || 0,
        userId: req.user?.id,
        backend: 'Render.com',
        status: 'success'
      }
    };
    
    console.log('✅ تم إنشاء النتيجة:', result);
    
    // إرجاع النتيجة فوراً
    res.json(result);
    
  } catch (error) {
    console.error('❌ خطأ في المعالجة:', error);
    
    // حتى في حالة الخطأ، أعد نتيجة
    res.status(200).json({
      itemType: 'plastic_bottle',
      itemName: 'زجاجة بلاستيكية',
      isRecyclable: true,
      confidence: 0.9,
      nearestLocation: {
        id: 1,
        name: 'نظام الطوارئ',
        address: 'الموقع الافتراضي',
        latitude: 24.7136,
        longitude: 46.6753,
        distance: '1.0 كم',
        type: 'plastic'
      },
      pointsEarned: 10,
      emergencyMode: true,
      message: 'النظام يعمل في وضع الطوارئ',
      timestamp: new Date().toISOString()
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