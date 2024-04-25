// categoryController.js

const Category = require("../models/category");

// Service for category-related operations

const categoryService = {
  getAllCategories: async () => {
    try {
      return await Category.find();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  getCategoryById: async (id) => {
    try {
      return await Category.findById(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },

  createCategory: async (categoryData) => {
    try {
      const category = new Category(categoryData);
      return await category.save();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      return await Category.findByIdAndUpdate(id, categoryData, { new: true });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  deleteCategory: async (id) => {
    try {
      return await Category.findByIdAndDelete(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

// Controller for handling category-related operations

const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createCategory: async (req, res) => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body
      );
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await categoryService.deleteCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = categoryController;
