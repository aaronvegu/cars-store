const Car = require('../models/Car');
const Inventory = require('../models/Inventory');
const asyncHandler = require('express-async-handler');

// @desc Get all cars
// @route GET /cars
// @access Private
const getAllCars = asyncHandler(async (req, res) => {
  const cars = await Car.find().select().lean();
  if (!cars?.length) {
    return res.status(400).json({ message: 'No cars found' });
  }
  res.json(cars);
});

// @desc Create new car
// @route POST /cars
// @access Private
const createNewCar = asyncHandler(async (req, res) => {
  const { make, model, year, price, description, photos } = req.body;
  // confirm data
  if (
    !make ||
    !model ||
    !year ||
    !price ||
    !description ||
    !Array.isArray(photos)
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // check for duplicates
  const duplicate = await Car.findOne({ make, model, year }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate car' });
  }

  // create car object
  const carObject = {
    make,
    model,
    year,
    price,
    description,
    photos,
    active: true,
  };

  // create and store new car
  const car = await Car.create(carObject);

  if (car) {
    //created
    res.status(201).json({ message: `New car ${make} - ${model} created` });
  } else {
    res.status(400).json({ message: 'Invalid car data received' });
  }
});

// @desc Update a car
// @route PATCH /cars
// @access Private
const updateCar = asyncHandler(async (req, res) => {
  const { id, make, model, year, price, description, photos, active } =
    req.body;

  // confirm data
  if (
    !id ||
    !make ||
    !model ||
    !year ||
    !price ||
    !description ||
    !Array.isArray(photos) ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // does car exists?
  const car = await Car.findById(id).exec();

  if (!car) {
    return res.status(400).json({ message: 'Car not found' });
  }

  // check for duplicate
  const duplicate = await Car.findOne({ make, model, year }).lean().exec();
  // allow updates to the original car
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate car' });
  }

  car.make = make;
  car.model = model;
  car.year = year;
  car.price = price;
  car.description = description;
  car.photos = photos;
  car.active = active;

  const updatedCar = await car.save();

  res.json({ message: `${updatedCar.make} updated` });
});

// @desc Delete a car
// @route DELETE /cars
// @access Private
const deleteCar = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Car ID required' });
  }

  const inventory = await Inventory.findOne({ carID: id }).lean().exec();
  if (inventory?.length) {
    return res.status(400).json({ message: 'Car has assigned inventory' });
  }

  const car = await Car.findById(id).exec();

  if (!car) {
    return res.status(400).json({ message: 'Car not found' });
  }

  const result = await car.deleteOne();

  const reply = `Car ${result.make} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllCars,
  createNewCar,
  updateCar,
  deleteCar,
};
