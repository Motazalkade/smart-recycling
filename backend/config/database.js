// database-memory.js - قاعدة بيانات مؤقتة في الذاكرة
const bcrypt = require('bcryptjs');

// قاعدة بيانات في الذاكرة
let database = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@recycling.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      points: 0,
      created_at: new Date().toISOString()
    }
  ],
  recycling_locations: [
    {
      id: 1,
      name: 'جهاز إعادة تدوير البلاستيك - الرياض',
      address: 'الرياض، حي الملز',
      latitude: 24.7136,
      longitude: 46.6753,
      type: 'plastic',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'جهاز إعادة تدوير الورق - جدة',
      address: 'جدة، حي الصفا',
      latitude: 21.4858,
      longitude: 39.1925,
      type: 'paper',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'جهاز إعادة تدوير عام - الدمام',
      address: 'الدمام، حي الشاطئ',
      latitude: 26.4207,
      longitude: 50.0888,
      type: 'general',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'جهاز إعادة تدوير المعادن - الرياض',
      address: 'الرياض، حي العليا',
      latitude: 24.7616,
      longitude: 46.6730,
      type: 'metal',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'جهاز إعادة تدوير الزجاج - جدة',
      address: 'جدة، حي السلامة',
      latitude: 21.5433,
      longitude: 39.1730,
      type: 'glass',
      created_at: new Date().toISOString()
    }
  ],
  recycling_items: []
};

let nextId = {
  users: 2,
  recycling_locations: 6,
  recycling_items: 1
};

const initDatabase = () => {
  console.log('✅ تم تهيئة قاعدة البيانات في الذاكرة');
};

// محاكاة دوال SQLite
const db = {
  // SELECT query - للحصول على جميع السجلات
  all: (sql, params = []) => {
    if (sql.includes('FROM recycling_locations')) {
      return database.recycling_locations;
    }
    if (sql.includes('FROM users')) {
      return database.users;
    }
    if (sql.includes('FROM recycling_items')) {
      return database.recycling_items;
    }
    return [];
  },

  // SELECT query - للحصول على سجلات متعددة
  query: (sql, params = []) => {
    return db.all(sql, params);
  },

  // SELECT single row
  get: (sql, params = []) => {
    if (sql.includes('FROM users WHERE email = ?')) {
      return database.users.find(user => user.email === params[0]);
    }
    if (sql.includes('FROM users WHERE id = ?')) {
      return database.users.find(user => user.id === params[0]);
    }
    if (sql.includes('FROM users WHERE username = ?')) {
      return database.users.find(user => user.username === params[0]);
    }
    if (sql.includes('FROM recycling_locations WHERE id = ?')) {
      return database.recycling_locations.find(loc => loc.id === params[0]);
    }
    return null;
  },

  // INSERT/UPDATE/DELETE
  run: (sql, params = []) => {
    if (sql.includes('INSERT INTO users')) {
      const newUser = {
        id: nextId.users++,
        username: params[0],
        email: params[1],
        password: params[2],
        role: 'user',
        points: 0,
        created_at: new Date().toISOString()
      };
      database.users.push(newUser);
      return { lastID: newUser.id, changes: 1 };
    }

    if (sql.includes('INSERT INTO recycling_items')) {
      const newItem = {
        id: nextId.recycling_items++,
        user_id: params[0],
        item_type: params[1],
        image_path: params[2],
        is_recyclable: params[3] ? 1 : 0,
        nearest_location_id: params[4],
        created_at: new Date().toISOString()
      };
      database.recycling_items.push(newItem);
      return { lastID: newItem.id, changes: 1 };
    }

    if (sql.includes('UPDATE users SET points = points + ?')) {
      const points = params[0];
      const userId = params[1];
      const user = database.users.find(u => u.id === userId);
      if (user) {
        user.points += points;
        return { changes: 1 };
      }
    }

    if (sql.includes('UPDATE users SET points = points + 10')) {
      const userId = params[0];
      const user = database.users.find(u => u.id === userId);
      if (user) {
        user.points += 10;
        return { changes: 1 };
      }
    }

    return { lastID: 0, changes: 0 };
  }
};

module.exports = { db, initDatabase };