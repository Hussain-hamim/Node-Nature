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

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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

  createSendToken(newUser, 201, res);
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2) check if user exists && and password is correct
  const user = await User.findOne({ email: email }).select('+password'); // since we (selected: false) password in userModel so we have to fetch it here with '+password'
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  //3) if everything ok, send token to client
  createSendToken(user, 200, res);
};

// this middleware protect private routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check if its there
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

  // TODO: Done, GRANT ACCESS TO THE PROTECTED ROUTES
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
  //1) Find User by Email: check if user exist with this email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email', 404));
  }

  //2) generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to user email e.g. //https://localhost/api/v1/user/resetPassword/98kljf94kj49093484jk //////https://example.com/api/v1/users/resetPassword/1234567890abcdef
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  // protocol: http or https, host: localhost:3000 or 8080,  req.get('host') method retrieves the host name from the request headers

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
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) update changedPasswordAt property for the user
  // this is handled by pre hook middleware

  //4) log the user in, send jwt
  createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  //1) get the user from the collection
  const user = await User.findById(req.user.id).select('+password'); // if we are logged in so we can find user in req

  //2) check if posted current password is correct with password in db, correctPassword use bcrypt.compare method
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('your current password is wrong'));
  }

  //3)if you come this far, if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // this User.findByIdAndUpdate() will not work as intended!

  //4) log user in, send jwt
  createSendToken(user, 200, res);
};
