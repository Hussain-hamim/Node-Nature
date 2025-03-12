const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty'],
    },
    ratingAverage: { type: Number, default: 4.5 },
    ratingQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'a tour must have price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true, // remove extra whites spaces
      required: [true, 'a tou must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'a tou must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
    startLocation: {
      // geoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('uppName').get(function () {
  return this.name.toUpperCase();
});

// document middleware or hooks
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next(); // this will run before we save doc to db
});

// tourSchema.post('save', function (doc, next) {
//   // console.log(doc);// current saved doc
//   console.log('doc successfully saved');
//   next(); // this will run after doc saved to db
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // by this the secret tour wont show
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`the query took ${Date.now() - this.start} milliseconds`);
  next();
});

tourSchema.pre('find', function (next) {
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATE MIDDLEWARE: mongoose middleware or hook that allow to execute a fn before an aggregation pipeline is executed on model like before Tour.aggregate([])
// this allow us to enhance the pipeline for all aggregation on the model
tourSchema.pre('aggregate', function (next) {
  // inside this fn we can access and modify the aggregation pipeline which is and array of stages
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // we are removing from the output the vip tour with aggregate
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
