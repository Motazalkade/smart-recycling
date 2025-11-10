const express = require('express');
const { processRecyclingItem, getRecyclingLocations, getUserHistory } = require('../controllers/recyclingController');
const { auth } = require('../middleware/auth');
const handleFileUpload = require('../middleware/upload-basic');

const router = express.Router();

router.post('/process', auth, handleFileUpload, processRecyclingItem);
router.get('/locations', getRecyclingLocations);
router.get('/history', auth, getUserHistory);

module.exports = router;