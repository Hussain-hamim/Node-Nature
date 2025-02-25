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
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server.`,
  });

  next();
});

module.exports = app;
