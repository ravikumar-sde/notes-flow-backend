const dataAccess = require('../data-access');
const services = require('../services');
const businessLogic = require('../business-logic');
const createPageController = require('./pageController');

const pageController = createPageController(dataAccess, services, businessLogic);

module.exports = {
  ...pageController,
};

