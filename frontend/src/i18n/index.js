import { createI18n } from 'vue-i18n'

// الترجمات العربية
// الترجمات العربية
const arMessages = {
  app: {
    name: 'موقع إعادة التدوير الذكي'
  },
  welcome: {
    title: 'مرحباً بك!',
    subtitle: 'اختر اللغة المفضلة للبدء في رحلة إعادة التدوير',
    chooseLanguage: 'اختر اللغة',
    continue: 'المتابعة إلى التطبيق'
  },
  common: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل خروج',
    home: 'الرئيسية',
    recycling: 'التدوير',
    profile: 'حسابي',
    admin: 'الإدارة',
    points: 'النقاط',
    scan: 'مسح',
    locations: 'المواقع',
    history: 'السجل',
    stats: 'الإحصائيات'
  },
  auth: {
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟'
  },
  home: {
    welcome: 'مرحباً بك في موقع إعادة التدوير الذكي',
    description: 'استخدم كاميرا هاتفك للتعرف على المواد القابلة للتدوير واكتشف أقرب مواقع إعادة التدوير إليك',
    features: 'مميزات التطبيق',
    feature1: 'التعرف على الصور',
    feature1Desc: 'التقط صورة لأي مادة لمعرفة إذا كانت قابلة للتدوير',
    feature2: 'خرائط تفاعلية',
    feature2Desc: 'اكتشف أقرب مواقع إعادة التدوير بناءً على موقعك',
    feature3: 'نظام النقاط',
    feature3Desc: 'اكسب نقاطاً لكل مادة تعيد تدويرها وتنافس مع الآخرين',
    feature4: 'إحصائيات شخصية',
    feature4Desc: 'تابع إحصائياتك وتأثيرك الإيجابي على البيئة',
    yourStats: 'إحصائياتك',
    totalPoints: 'إجمالي النقاط',
    scannedItems: 'المواد الممسوحة',
    recyclableItems: 'مواد قابلة للتدوير',
    startRecycling: 'بدء التدوير',
    myAccount: 'حسابي'
  },
  recycling: {
    title: 'إعادة التدوير الذكي',
    scanMaterials: 'مسح المواد',
    recyclingLocations: 'مواقع إعادة التدوير',
    scanResults: 'نتائج المسح',
    materialType: 'نوع المادة',
    recyclable: 'قابل للتدوير',
    notRecyclable: 'غير قابل للتدوير',
    nearestLocation: 'أقرب موقع',
    pointsEarned: 'النقاط المكتسبة',
    recyclingHistory: 'سجل التدوير',
    takePhoto: '📸 التقاط صورة',
    switchCamera: '🔁 تبديل الكاميرا',
    uploadImage: '📁 رفع صورة',
    retakePhoto: '🔄 إعادة الالتقاط',
    analyzeMaterial: 'تحليل المادة',
    processing: 'جاري المعالجة...',
    distance: 'المسافة',
    km: 'كم'
  },
  profile: {
    title: 'الملف الشخصي',
    accountInfo: 'معلومات الحساب',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    joinDate: 'تاريخ الانضمام',
    yourStats: 'إحصائياتك',
    totalPoints: 'إجمالي النقاط',
    scannedItems: 'المواد الممسوحة',
    recyclableItems: 'مواد قابلة للتدوير',
    recyclingRate: 'نسبة التدوير',
    recentActivity: 'آخر النشاطات',
    achievements: 'الإنجازات',
    beginner: 'المبتدئ',
    beginnerDesc: 'مسح 5 مواد',
    activeRecycler: 'المدور النشط',
    activeRecyclerDesc: 'مسح 20 مادة',
    ecoChampion: 'بطل البيئة',
    ecoChampionDesc: 'اكتساب 100 نقطة',
    recyclingExpert: 'خبير التدوير',
    recyclingExpertDesc: 'نسبة تدوير 80%'
  },
  admin: {
    title: 'لوحة التحكم الإدارية',
    generalStats: 'إحصائيات عامة',
    totalUsers: 'إجمالي المستخدمين',
    totalScans: 'إجمالي المسوحات',
    recyclableItems: 'مواد قابلة للتدوير',
    totalPoints: 'إجمالي النقاط',
    usersManagement: 'إدارة المستخدمين',
    locationsManagement: 'إدارة مواقع التدوير',
    systemActivity: 'نشاط النظام',
    addLocation: 'إضافة موقع جديد',
    edit: 'تعديل',
    delete: 'حذف',
    todayActivity: 'نشاط اليوم',
    recyclingRate: 'نسبة التدوير'
  },
  materials: {
    plastic_bottle: 'زجاجة بلاستيكية',
    paper: 'ورق',
    glass: 'زجاج',
    metal_can: 'علبة معدنية',
    plastic_bag: 'كيس بلاستيكي',
    food_waste: 'مخلفات طعام',
    styrofoam: 'ستايروفوم'
  },
  footer: {
    description: 'نساعدك في العثور على أقرب مواقع إعادة التدوير والتعرف على المواد القابلة للتدوير',
    quickLinks: 'روابط سريعة',
    contactInfo: 'معلومات الاتصال',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    rights: 'جميع الحقوق محفوظة'
  }
}

// الترجمات الإنجليزية
const enMessages = {
  app: {
    name: 'Smart Recycling Site'
  },
  welcome: {
    title: 'Welcome!',
    subtitle: 'Choose your preferred language to start your recycling journey',
    chooseLanguage: 'Choose Language',
    continue: 'Continue to App'
  },
  common: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    home: 'Home',
    recycling: 'Recycling',
    profile: 'Profile',
    admin: 'Admin',
    points: 'Points',
    scan: 'Scan',
    locations: 'Locations',
    history: 'History',
    stats: 'Statistics'
  },
  auth: {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    login: 'Login',
    register: 'Register',
    noAccount: 'Don\'t have an account?',
    haveAccount: 'Already have an account?'
  },
  home: {
    welcome: 'Welcome to Smart Recycling Site',
    description: 'Use your phone camera to identify recyclable materials and discover the nearest recycling locations',
    features: 'App Features',
    feature1: 'Image Recognition',
    feature1Desc: 'Take a picture of any material to see if it\'s recyclable',
    feature2: 'Interactive Maps',
    feature2Desc: 'Discover the nearest recycling locations based on your location',
    feature3: 'Points System',
    feature3Desc: 'Earn points for each material you recycle and compete with others',
    feature4: 'Personal Statistics',
    feature4Desc: 'Track your statistics and positive impact on the environment',
    yourStats: 'Your Statistics',
    totalPoints: 'Total Points',
    scannedItems: 'Scanned Items',
    recyclableItems: 'Recyclable Items',
    startRecycling: 'Start Recycling',
    myAccount: 'My Account'
  },
  recycling: {
    title: 'Smart Recycling',
    scanMaterials: 'Scan Materials',
    recyclingLocations: 'Recycling Locations',
    scanResults: 'Scan Results',
    materialType: 'Material Type',
    recyclable: 'Recyclable',
    notRecyclable: 'Not Recyclable',
    nearestLocation: 'Nearest Location',
    pointsEarned: 'Points Earned',
    recyclingHistory: 'Recycling History',
    takePhoto: '📸 Take Photo',
    switchCamera: '🔁 Switch Camera',
    uploadImage: '📁 Upload Image',
    retakePhoto: '🔄 Retake Photo',
    analyzeMaterial: 'Analyze Material',
    processing: 'Processing...',
    distance: 'Distance',
    km: 'km'
  },
  profile: {
    title: 'Profile',
    accountInfo: 'Account Information',
    username: 'Username',
    email: 'Email',
    role: 'Role',
    joinDate: 'Join Date',
    yourStats: 'Your Statistics',
    totalPoints: 'Total Points',
    scannedItems: 'Scanned Items',
    recyclableItems: 'Recyclable Items',
    recyclingRate: 'Recycling Rate',
    recentActivity: 'Recent Activity',
    achievements: 'Achievements',
    beginner: 'Beginner',
    beginnerDesc: 'Scan 5 materials',
    activeRecycler: 'Active Recycler',
    activeRecyclerDesc: 'Scan 20 materials',
    ecoChampion: 'Eco Champion',
    ecoChampionDesc: 'Earn 100 points',
    recyclingExpert: 'Recycling Expert',
    recyclingExpertDesc: '80% recycling rate'
  },
  admin: {
    title: 'Admin Dashboard',
    generalStats: 'General Statistics',
    totalUsers: 'Total Users',
    totalScans: 'Total Scans',
    recyclableItems: 'Recyclable Items',
    totalPoints: 'Total Points',
    usersManagement: 'Users Management',
    locationsManagement: 'Locations Management',
    systemActivity: 'System Activity',
    addLocation: 'Add New Location',
    edit: 'Edit',
    delete: 'Delete',
    todayActivity: 'Today\'s Activity',
    recyclingRate: 'Recycling Rate'
  },
  materials: {
    plastic_bottle: 'Plastic Bottle',
    paper: 'Paper',
    glass: 'Glass',
    metal_can: 'Metal Can',
    plastic_bag: 'Plastic Bag',
    food_waste: 'Food Waste',
    styrofoam: 'Styrofoam'
  },
  footer: {
    description: 'We help you find the nearest recycling locations and identify recyclable materials',
    quickLinks: 'Quick Links',
    contactInfo: 'Contact Information',
    email: 'Email',
    phone: 'Phone',
    rights: 'All rights reserved'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'ar',
  fallbackLocale: 'ar',
  messages: {
    ar: arMessages,
    en: enMessages
  }
})

export default i18n