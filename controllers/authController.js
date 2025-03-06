/* eslint-disable no-undef */
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // check if user exists && and password is correct
  const user = await User.findOne({ email: email }).select('+password'); // since we (selected: false) password in userModel so we have to fetch it here with '+password'
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  // if everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
};

// this middleware protect private routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting toke and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('you are not logged in! please log in to get access.', 401),
    );
  }

  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // const decoded = jwt.verify(token, process.env.JWT_SECRET); // this is the same as above

  //3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belong to this token no longer exist', 401),
    );
  }

  //4) check if user changed password after teh token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password! please log in again.', 401),
    );
  }

  // GRANT ACCESS TO THE PROTECTED ROUTES
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // role: ['admin', 'lead-guide'] role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403),
      );
    }
    // this middleware only allow to admin user to delete a tour
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email', 404));
  }

  //2) generate the random reset token
  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  //3) send it to user email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 min)',
      message,
    });

    res.status('200').json({
      status: 'success',
      message: 'token sent to email',
    });
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sending the email. try again later!'),
      500,
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  //1) get user based on token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken, // find the user with token
    passwordResetExpires: { $gt: Date.now() }, // and confirm that it not expired
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = req.body.passwordResetToken;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) update changedPasswordAt property for the user

  //4) log the user in, send jwt
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
};
