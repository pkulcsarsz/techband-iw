'use strict';

require('dotenv').config();

const express = require('express');
const { startSynchronization } = require('./services/synchronizer');


const app = express();

//start the synchronization
startSynchronization();

app.listen(3031, "0.0.0.0",  () => {
  console.log('Service listening on port ' + 3031);
});

