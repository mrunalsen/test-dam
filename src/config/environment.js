require('dotenv').config();
const path = require('path');

module.exports = {
    PORT: process.env.PORT || 1000,
    UPLOADS_DIR: path.join(__dirname, '..', 'uploads'),
    API_BASE_URL: 'http://172.16.0.5:8088/api/project',
    ICONS_BASE_URL: 'http://172.16.0.5:8088'
};