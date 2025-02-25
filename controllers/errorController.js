const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // operational
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // programming or unknown
  } else {
    console.error('ERROR: 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'something went wrong.',
    });
  }
};

module.exports = (err, req, res, next) => {
  // if the err object could not find any value for status and code then it will run this default value
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorProd(err, res);
  }
};
