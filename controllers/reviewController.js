const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReview = catchAsync(async (req, res) => {
  let filter = {}; // for nested routes --
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.setTourUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // take the id dynamically from url
  if (!req.body.user) req.body.user = req.user.id;
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
