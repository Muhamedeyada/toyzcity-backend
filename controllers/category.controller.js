const CustomError = require("../utils/CustomError");
const {
  uploadToImageKit,
  deleteFromImageKit,
  updateImageInImageKit,
} = require("../utils/imageKitConfig");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../utils/validation/category.validation");

class CategoryController {
  categoryRepository;
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async createCategory(category) {
    const { error } = createCategorySchema.validate(category, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(", ").replace(/"/g, ""), 400);
    }
    const existingCategory = await this.categoryRepository.findOne({
      name: category.name,
    });
    if (existingCategory) {
      throw new CustomError("Category name must be unique", 400);
    }
    if (
      !category.thumbnail ||
      !category.thumbnail.thumbnail ||
      category.thumbnail.thumbnail.length === 0
    ) {
      throw new CustomError("Thumbnail is required", 400);
    }
    const thumbnailFile = category.thumbnail.thumbnail[0];
    const imageKitResponse = await uploadToImageKit(
      thumbnailFile,
      thumbnailFile.originalname,
      "category_thumbnails"
    );
    if (!imageKitResponse || !imageKitResponse.url) {
      throw new CustomError("Image upload failed", 500);
    }
    category.thumbnail = imageKitResponse.url;
    category.thumbnailFileId = imageKitResponse.fileId;
    return await this.categoryRepository.createCategory(category);
  }

  async getAllCategories() {
    return await this.categoryRepository.getAllCategories();
  }

  async getCategoryById(id) {
    const category = await this.categoryRepository.getCategoryById(id);
    if (!category)
      throw new CustomError("Wrong category id, Category not found", 404);
    return category;
  }

  async updateCategory(id, newCategoryData) {
    const { error } = updateCategorySchema.validate(newCategoryData, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(", ").replace(/"/g, ""), 400);
    }
    const existingCategory = await this.categoryRepository.getCategoryById(id);
    if (!existingCategory) throw new CustomError("Category not found", 404);
    if (newCategoryData.name) {
      const existingCategory = await this.categoryRepository.findOne({
        name: newCategoryData.name,
      });
      if (existingCategory) {
        throw new CustomError("Category name must be unique", 400);
      }
    }
    if (newCategoryData.thumbnail) {
      const thumbnailFile = newCategoryData.thumbnail;
      const imageKitResponse = await updateImageInImageKit(
        existingCategory.thumbnailFileId,
        thumbnailFile,
        thumbnailFile.originalname,
        "category_thumbnails"
      );
      newCategoryData.thumbnail = imageKitResponse.url;
      newCategoryData.thumbnailFileId = imageKitResponse.fileId;
    }
    const newCategory = await this.categoryRepository.updateCategory(
      id,
      newCategoryData
    );
    return newCategory;
  }

  async deleteCategory(id) {
    const deletedCategory = await this.categoryRepository.deleteCategory(id);
    if (!deletedCategory) throw new CustomError("Category not found", 404);
    await deleteFromImageKit(deletedCategory.thumbnailFileId);
    return deletedCategory;
  }

  async getCategoryByName(categoryName) {
    if (!categoryName) throw new CustomError("Category name is required", 400);
    return await this.categoryRepository.getCategoryByName(categoryName);
  }
}

module.exports = CategoryController;
