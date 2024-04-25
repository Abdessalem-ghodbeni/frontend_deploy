const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

// Define routes for sub-category endpoints
router.get('/', subCategoryController.getAllSubCategories);
router.get('/:id', subCategoryController.getSubCategoryById);
router.post('/', subCategoryController.createSubCategory);
router.put('/:id', subCategoryController.updateSubCategory);
router.delete('/:id', subCategoryController.deleteSubCategory);

module.exports = router;
