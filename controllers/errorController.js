module.exports = (err, req, res, next) => {
  // if the err object could not find any value for status and code then it will run this default value
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
