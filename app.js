/* eslint-disable linebreak-style */
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const responseTime = require('response-time');
const estimatorApi = require('./src/api/estimatorApi');
const ResopnseLog = require('./src/model/ResponseLog');

dotenv.config({ path: '.env' });
/* eslint-disable no-console */
const app = express();
// use response time
app.use(responseTime((req, res, time) => {
  console.log(req.method, req.url, `${time} ms`);
  ResopnseLog({ url: req.url, time }).save();
}));

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => {
  console.log('Successfully connected to the database');
}).catch((err) => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ROUTES
app.get('/', (req, res) => {
  res.send('You Setted UP <br> post to /api/v1/on-covid-19');
});
app.get('/api/v1/on-covid-19', (req, res) => {
  res.send('POST: /api/v1/on-covid-19');
});
app.post('/api/v1/on-covid-19', estimatorApi.estimatorJsonV1);
app.post('/api/v1/on-covid-19/json', estimatorApi.estimatorJsonV1);
app.post('/api/v1/on-covid-19/xml', estimatorApi.estimatorXmlV1);
app.get('/api/v1/on-covid-19/logs', estimatorApi.estimatorLogsV1);


app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
module.exports = app;
