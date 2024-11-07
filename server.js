const express = require('express');
const bodyParser = require('body-parser');
const trackerRoutes = require('./myTracker');
require('dotenv').config();





const app = express();

app.use(bodyParser.json());

app.use(trackerRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server listening on ${process.env.PORT}`)
})

