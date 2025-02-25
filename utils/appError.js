class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // the message prop already in parent so thats why we didn't specify as this.message

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
