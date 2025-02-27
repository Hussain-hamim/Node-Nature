const crypto = require('crypto');
const mongoose = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    // validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // validate: {
    //   // This only works on CREATE and SAVE!!!
    //   validator: function (el) {
    //     return el === this.password;
    //   },
    //   message: 'Passwords are not the same!',
    // },
  },
});

userSchema.pre('save', async function (next) {
  // this run only if password only actually was modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
