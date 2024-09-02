const express = require('express');
const router = express.Router();
const svgController = require('../controllers/publishController');
const packageController = require('../controllers/packageController');

router.get('/download', packageController.downloadPackage);
router.get('/publish', svgController.publishPackage);
router.get('/test', (req, res) => {
    res.send('API is working!');
});

module.exports = router;
