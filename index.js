const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

const routes = require('./src/routes/svgRoutes');
app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
