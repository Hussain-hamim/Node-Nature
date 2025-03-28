const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID); // this middleware will only run in tour route -- if send invalid id this middleware will check it

//POST /tour/3i3j43/reviews
//GET /tour/3i3j43/reviews
//GET /tour/3i3j43/reviews/9r9930re9e
// for nested route
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap') // we just run a middleware before getting this alias router
  .get(tourController.aliasTopTours, tourController.getAllTour);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  // .get(authController.protect, tourController.getAllTour)
  .get(tourController.getAllTour)
  .post(
    // authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    // authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    // authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
