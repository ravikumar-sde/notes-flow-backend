const express = require('express');
const controllers = require('../controllers');

const router = express.Router();

// Create a new page
router.post('/', controllers.createPage);

// Get a single page by ID
router.get('/:id', controllers.getPageById);

// Get child pages of a page
router.get('/:id/children', controllers.getChildPages);

// Update a page
router.put('/:id', controllers.updatePage);
router.patch('/:id', controllers.updatePage);

// Move a page to a different parent
router.patch('/:id/move', controllers.movePage);

// Archive/unarchive a page
router.patch('/:id/archive', controllers.archivePage);

// Delete a page permanently
router.delete('/:id', controllers.deletePage);

module.exports = router;

