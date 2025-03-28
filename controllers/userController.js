const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]; // if the field is allowed then add it to the new object to be returned else ignore it and move to the next field in the object to be checked  and so on till all fields are checked
  });
  return newObj;
}; // this function will filter out the fields that are not allowed to be updated  like password

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined, please use /signup',
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

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// do not update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
