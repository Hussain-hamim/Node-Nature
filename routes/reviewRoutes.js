const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

//POST /tour/3i3j43/reviews
//POST /reviews

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;
