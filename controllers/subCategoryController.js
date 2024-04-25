// subCategoryController.js

// const SubCategory = require("../models/subCategory");
const SubCategory = require("../models/subcategory");
// Service for sub-category-related operations

const subCategoryService = {
  getAllSubCategories: async () => {
    try {
      return await SubCategory.find();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  getSubCategoryById: async (id) => {
    try {
      return await SubCategory.findById(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },

  createSubCategory: async (subCategoryData) => {
    try {
      const subCategory = new SubCategory(subCategoryData);
      return await subCategory.save();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  updateSubCategory: async (id, subCategoryData) => {
    try {
      return await SubCategory.findByIdAndUpdate(id, subCategoryData, {
        new: true,
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  deleteSubCategory: async (id) => {
    try {
      return await SubCategory.findByIdAndDelete(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

// Controller for handling sub-category-related operations

const subCategoryController = {
  getAllSubCategories: async (req, res) => {
    try {
      const subCategories = await subCategoryService.getAllSubCategories();
      res.json(subCategories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getSubCategoryById: async (req, res) => {
    try {
      const subCategory = await subCategoryService.getSubCategoryById(
        req.params.id
      );
      if (!subCategory) {
        return res.status(404).json({ message: "Sub-category not found" });
      }
      res.json(subCategory);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createSubCategory: async (req, res) => {
    try {
      const subCategory = await subCategoryService.createSubCategory(req.body);
      res.status(201).json(subCategory);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateSubCategory: async (req, res) => {
    try {
      const subCategory = await subCategoryService.updateSubCategory(
        req.params.id,
        req.body
      );
      if (!subCategory) {
        return res.status(404).json({ message: "Sub-category not found" });
      }
      res.json(subCategory);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteSubCategory: async (req, res) => {
    try {
      const subCategory = await subCategoryService.deleteSubCategory(
        req.params.id
      );
      if (!subCategory) {
        return res.status(404).json({ message: "Sub-category not found" });
      }
      res.json({ message: "Sub-category deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = subCategoryController;
