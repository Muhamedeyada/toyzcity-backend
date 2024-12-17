const Category = require("../models/category.model");

class CategoryRepository {
  async createCategory(category) {
    const newCategory = new Category(category);
    return await newCategory.save();
  }

  async getAllCategories() {
    return await Category.find({});
  }

  async findOne(query) {
    return await Category.findOne(query);
  }

  async getCategoryById(id) {
    return await Category.findById(id);
  }

  async updateCategory(id, newCategoryData) {
    return await Category.findByIdAndUpdate(id, newCategoryData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteCategory(id) {
    return await Category.findByIdAndDelete(id);
  }

  async addItemToCategory(categoryName, itemId) {
    return await Category.findOneAndUpdate(
      { name: categoryName },
      { $push: { items: itemId } },
      { new: true, runValidators: true }
    );
  }

  async getCategoryByName(categoryName) {
    return await Category.findOne({ name: categoryName });
  }
}

module.exports = CategoryRepository;
