const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError('document not found with given id', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(new AppError('document not found with given id', 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body); // newdoc.save(); // create do this two line at the same time  // const newdoc = new doc({});

    if (!newDoc) return next(new AppError('doc not found with given id', 404));

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc)
      return next(new AppError('document not found with given id', 404));

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {}; // this two line only for getting all reviews
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query.explain(); // .explain() will show the statistics of the query

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc },
    });
  });
