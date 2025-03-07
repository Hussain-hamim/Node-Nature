const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(500).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};

exports.updateMe = (req, res, next) => {
  //1) create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password updates, use /updateMe route',
        400,
      ),
    );
  }

  //2) update user doc
  res.status(200).json({
    status: 'success',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
