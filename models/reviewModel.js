// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tour and user populate pre hook
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name',
  //   });

  this.populate({
    path: 'user',
    select: 'name',
  });

  next();
});

// this is a static method because we want to call it on the model and not on the document
// static method to calculate average rating and quantity
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = this.aggregate([
    { $match: { tour: tourId } }, // select all reviews that match the tourId
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingQuantity: stats[0].nRating, // stats[0] because stats is an array of objects
    ratingAverage: stats[0].avgRating, // stats[0] because stats is an array of objects
  });
};

reviewSchema.post('save', function (next) {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour); // this.constructor points to the model that created the document
  next();
});

reviewSchema.pre(/findOneAnd/, async function () {
  //
  const r = await this.findOne();
  console.log(r);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
