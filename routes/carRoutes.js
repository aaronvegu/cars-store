const express = require('express');
const router = express.Router();
const carsController = require('../controllers/carsController');

router
  .route('/')
  .get(carsController.getAllCars)
  .post(carsController.createNewCar)
  .patch(carsController.updateCar)
  .delete(carsController.deleteCar);

module.exports = router;
