const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

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

exports.getAllTour = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } }, // add field
      { $project: { _id: 0 } }, // here we hide the _id field by 0
      { $sort: { numTourStart: -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      status: 'success',
      data: plan,
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};
