const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // take the id dynamically from url
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
