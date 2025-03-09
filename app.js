/* eslint-disable no-undef */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//1) GLOBAL MIDDLEWARE

// security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit request from same api
const limiter = rateLimit({
  max: 100,
  WindowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour.',
});
app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// data sanitization against noSQL query injection
app.use(mongoSanitize());

// data sanitize against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
); // http parameter pollution

// serving static files
app.use(express.static('./public'));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// mounting routers
app.use('/api/v1/tours', tourRouter); // create a small sub system for each resources
app.use('/api/v1/users', userRouter);

// route for all undefined routes to give error message
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404)); // we made a custom class for error
});

// a custom global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
