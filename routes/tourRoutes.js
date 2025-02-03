const express = require('express');

const tourController = require('./../controllers/tourController');

const router = express.Router();

// router.param('id', tourController.checkID); // this middleware will only run in tour route -- if send invalid id this middleware will check it

router
  .route('/top-5-cheap') // we just run a middleware before getting this alias router
  .get(tourController.aliasTopTours, tourController.getAllTour);

router
  .route('/')
  .get(tourController.getAllTour)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
