const dataAccess = require('../data-access');
const services = require('../services');
const businessLogic = require('../business-logic');
const Joi = require('joi');

const makeCreatePage = require('./createPage');
const createPage = makeCreatePage({ dataAccess, services, businessLogic, Joi });

const makeGetPageById = require('./getPageById');
const getPageById = makeGetPageById({ dataAccess, services, businessLogic, Joi });

const makeUpdatePage = require('./updatePage');
const updatePage = makeUpdatePage({ dataAccess, services, businessLogic, Joi });

const makeMovePage = require('./movePage');
const movePage = makeMovePage({ dataAccess, services, businessLogic, Joi });

const makeArchivePage = require('./archivePage');
const archivePage = makeArchivePage({ dataAccess, services, businessLogic, Joi });

const makeDeletePage = require('./deletePage');
const deletePage = makeDeletePage({ dataAccess, services, businessLogic, Joi });

const makeGetWorkspacePages = require('./getWorkspacePages');
const getWorkspacePages = makeGetWorkspacePages({ dataAccess, services, businessLogic, Joi });

const makeGetChildPages = require('./getChildPages');
const getChildPages = makeGetChildPages({ dataAccess, services, Joi });

module.exports = {
  createPage,
  getPageById,
  updatePage,
  movePage,
  archivePage,
  deletePage,
  getWorkspacePages,
  getChildPages,
};

