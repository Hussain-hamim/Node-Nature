const fs = require('fs');
const Tour = require('./../models/tourModel');

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

exports.getAllTour = async (req, res) => {
  try {
    // BUILD THE QUERY
    // 1. filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // this fields will be excluded from the query param even if we specify
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2. advanced filtering
    let queryStr = JSON.stringify(queryObj); // filtering in querying
    // we take the query oject and add $ cuz that what query object give us except that we need $ to add to filter correctly in database e.g. {duration: {$gt: 5}}
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // we send query from postman like this: http://127.0.0.1:8000/api/v1/tours?duration[gt]=5&price[lt]=1500

    // const allTours = await Tour.find({ duration: 5, difficulty: 'easy' });
    const query = Tour.find(JSON.parse(queryStr));

    // const allTours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // EXECUTE THE QUERY
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
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
