const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static('./public'));

// app.use((req, res, next) => {
//   console.log('hello from middleware 🙌');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();

//   next();
// });

// mounting routers
app.use('/api/v1/tours', tourRouter); // create a small sub system for each resources
app.use('/api/v1/users', userRouter);

// route for all undefined routes to give error message
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server.`,
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this server.`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

// a custom global error handling middleware
app.use((err, req, res, next) => {
  // if the err object could not find any value for status and code then it will run this default value
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
