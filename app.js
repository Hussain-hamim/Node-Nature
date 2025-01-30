const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  console.log('hello from middleware 🙌');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// ROUTE HANDLERS

// mounting router
app.use('/api/v1/tours', tourRouter); // create a small sub system for each resources
app.use('/api/v1/users', userRouter);

// START SEVER
const port = 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
