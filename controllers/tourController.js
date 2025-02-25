const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

// exports.checkID = (req, res, next, val) => {
//   console.log(`tour id ${val}`);
//   // for id checking we export this middleware fn
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
//   }
//   // this is param middleware if the val parameter dont exist then its normal middleware
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({ status: 'fail', message: 'bad request' });
//   }

//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTour = catchAsync(async (req, res, next) => {
  // // BUILD THE QUERY
  // // // 1a. filtering
  // // const queryObj = { ...req.query };
  // // const excludedFields = ['page', 'sort', 'limit', 'fields']; // this fields will be excluded from the query param even if we specify
  // // excludedFields.forEach((el) => delete queryObj[el]);

  // // // 1b. advanced filtering
  // // let queryStr = JSON.stringify(queryObj); // filtering in querying
  // // // we take the query oject and add $ cuz that what query object give us except that we need $ to add to filter correctly in database e.g. {duration: {$gt: 5}}
  // // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // we send query from postman like this: http://127.0.0.1:8000/api/v1/tours?duration[gt]=5&price[lt]=1500

  // // // const allTours = await Tour.find({ duration: 5, difficulty: 'easy' });
  // // let query = Tour.find(JSON.parse(queryStr));

  // // // 2. SORTING
  // // if (req.query.sort) {
  // //   const sortBy = req.query.sort.split(',').join(' '); // if someone send like; /api/v1/tours?sort=price,ratingAverage then we turn that , to space so sort become like this sort('price ratingsAverage')
  // //   query = query.sort(sortBy); // we can send req like this: .../api/tours?sort=price or -price for descending order
  // //   // sort(price ratingAverage)
  // // } else {
  // //   query = query.sort('-createdAt');
  // // }

  // // // 3. FIELDS
  // // if (req.query.fields) {
  // //   const fields = req.query.fields.split(',').join(' ');
  // //   query = query.select(fields);
  // // } else {
  // //   query = query.select('-__v');
  // // }

  // // // 4. PAGINATION
  // // const page = req.query.page * 1 || 1; // we also set default value
  // // const limit = req.query.limit * 1 || 100; // we multiply the query with 1 so that we convert the number in string passed to to number e.g. '1' * 1 = 1
  // // const skip = (page - 1) * limit; // prev page * limit = skip

  // // // page=3&limit=10 1-10 page 1, 11-20 page 2, 21-30 page 3
  // // query = query.skip(skip).limit(limit);
  // // // if we requested a page that do not exists:
  // // if (req.query.page) {
  // //   const toursCount = await Tour.countDocuments();
  // //   if (skip >= toursCount) throw new Error('this page does not exists.'); // we throw the error here so catch block will catch it
  // // }

  // // 5. ALIASING
  // //http://127.0.0.1:8000/api/v1/tours?limit=5&sort=-ratingAverage,price  // this query could be for top five tours
  //http://127.0.0.1:8000/api/v1/tours?limit=5&sort=-ratingAverage,price ====> http://127.0.0.1:8000/api/v1/tours/top-five-tours

  // // const allTours = await Tour.find()
  // //   .where('duration')
  // //   .equals(5)
  // //   .where('difficulty')
  // //   .equals('easy');

  // // EXECUTE THE QUERY
  // const features = new APIFeatures(Tour.find(), req.query)
  //   .filter()
  //   .sort()
  //   .limitFields()
  //   .paginate();

  // this is a class and we have define its object here so we called all method in that class
  // and every methods return THIS which mean that we can chain query on it, this class constructor take two args query and req query object
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) return next(new AppError('tour not found with given id', 404));

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body); // newTour.save(); // create do this two line at the same time  // const newTour = new Tour({});

  if (!newTour) return next(new AppError('tour not found with given id', 404));

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) return next(new AppError('tour not found with given id', 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError('tour not found with given id', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// aggregation pipeline [grouping, matching]:
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingAverage',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // not equal
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// aggregation pipeline [unwind, grouping, matching]:
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 }, // count docs
        tours: { $push: '$name' }, // this create an array and push element to it
      },
    },
    { $addFields: { month: '$_id' } }, // add field --- in _id field before we saved the startDates month
    { $project: { _id: 0 } }, // here we hide the _id field by 0 // projecting is for like selecting
    { $sort: { numTourStart: -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});
