var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
require('dotenv').config(); 

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var adsRouter = require('./routes/ads');
var characterRouter = require('./routes/character')
var audioRouter = require('./routes/audio');
var videoRouter = require('./routes/video');
var galleryRouter = require('./routes/gallery');
var prankRouter = require('./routes/prank');
// var spinRouter = require('./routes/spin');

var app = express();


// MongoDB connection
const mongoUri = process.env.MONGODB_URI; 

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

// Middleware configuration
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Disable directory listing
app.use(express.static(path.join(__dirname, 'public'), { index: false }));


app.use('/api/', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ads', adsRouter);
app.use('/api/character', characterRouter);
app.use('/api/audio', audioRouter);
app.use('/api/video', videoRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/prank', prankRouter);
// app.use('/api/spin', spinRouter);


// Logging middleware (Ensure this is correctly placed)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`Response Status: ${res.statusCode}`);
  });
  next();
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 0,
    message: "Not Found"
});
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
