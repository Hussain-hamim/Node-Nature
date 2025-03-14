const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

// router.param('id', tourController.checkID); // this middleware will only run in tour route -- if send invalid id this middleware will check it

router
  .route('/top-5-cheap') // we just run a middleware before getting this alias router
  .get(tourController.aliasTopTours, tourController.getAllTour);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTour)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

//POST /tour/3i3j43/reviews
//GET /tour/3i3j43/reviews
//GET /tour/3i3j43/reviews/9r9930re9e

router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('users', reviewController.createReview),
  );

module.exports = router;
