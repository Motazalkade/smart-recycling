const express = require('express');
const { processRecyclingItem, getRecyclingLocations, getUserHistory } = require('../controllers/recyclingController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Routes
router.post('/process', auth, upload.single('image'), processRecyclingItem);
router.get('/locations', getRecyclingLocations);
router.get('/history', auth, getUserHistory);

// Route للتحقق من أن recycling route يعمل
router.get('/test', (req, res) => {
    res.json({ message: 'Recycling route is working!' });
});

module.exports = router;