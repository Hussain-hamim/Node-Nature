const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]; // if the field is allowed then add it to the new object to be returned else ignore it and move to the next field in the object to be checked  and so on till all fields are checked
  });
  return newObj;
}; // this function will filter out the fields that are not allowed to be updated  like password

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

exports.updateMe = catchAsync(async (req, res, next) => {
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
  const filteredBody = filterObj(req.body, 'name', 'email'); // this will filter out the fields that are not allowed to be updated  like password and role and so on
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  updatedUser.name = 'hussain';
  // user.save(); cant use save here because it will not run the validators

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

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
