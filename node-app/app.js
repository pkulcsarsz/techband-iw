'use strict';

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { startSynchronization } = require('./services/synchronizer');

const app = express();

mongoose
  .connect(
    'mongodb://mongo:27017/hubspot-db',
    { useNewUrlParser: true,  useFindAndModify: false  }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

//start the synchronization
startSynchronization();

app.listen(3031, "0.0.0.0",  () => {
  console.log('Service listening on port ' + 3031);
});

