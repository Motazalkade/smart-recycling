const { db } = require('../config/database');

const getAllUsers = (req, res) => {
  db.all('SELECT id, username, email, role, points, created_at FROM users', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في جلب المستخدمين' });
    }
    res.json(rows);
  });
};

const updateUserRole = (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'الدور يجب أن يكون user أو admin' });
  }

  db.run(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'خطأ في تحديث الدور' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
      }
      res.json({ message: 'تم تحديث الدور بنجاح' });
    }
  );
};

const getUserStats = (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT 
      u.points as total_points,
      COUNT(ri.id) as total_items,
      SUM(CASE WHEN ri.is_recyclable = 1 THEN 1 ELSE 0 END) as recyclable_items
     FROM users u
     LEFT JOIN recycling_items ri ON u.id = ri.user_id
     WHERE u.id = ?
     GROUP BY u.id`,
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في جلب الإحصائيات' });
      }
      res.json(row || { total_points: 0, total_items: 0, recyclable_items: 0 });
    }
  );
};

module.exports = { getAllUsers, updateUserRole, getUserStats };