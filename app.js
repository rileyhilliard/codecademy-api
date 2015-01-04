var express = require('express');
var app = express();
var logger = require('./logger');
app.use(logger);
app.use(express.static('public'));

var codecademy = require('./routes/codecademy');
app.use('/codecademy',codecademy);

app.listen(3000, function(){
  console.log('listening on http://localhost:3000');
});
