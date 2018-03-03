'use strict';

var express = require('express');
var app = express();
var jsonParser = require('body-parser').json;
var routes = require('./routes');
var logger = require('morgan');

app.use(logger("dev"));

app.use(jsonParser());

'use strict'

var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/sandbox");

var db = mongoose.connection;

db.on("error", function(err) {
  console.error("connection error:", err);
});

db.once("open", function() {
  console.log("db connection successful");
  // All database communication goes here
});

app.use('/questions', routes);

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error Handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Express server is listening on port ", port);
});