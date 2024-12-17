const express = require("express");
const upload = require("../utils/multerConfig");
const router = express.Router();

const categoryRouter = (categoryController) => {
  router.get("/", async (req, res) => {
    const categories = await categoryController.getAllCategories();
    res.status(200).send({
      success: "Categories fetched successfully",
      categories,
    });
  });

  router.get("/name", async (req, res) => {
    const { categoryName } = req.query;
    const category = await categoryController.getCategoryByName(categoryName);
    res.status(200).send({
      success: "Category fetched successfully",
      category,
    });
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const category = await categoryController.getCategoryById(id);
    res.status(200).send({
      success: "Category fetched successfully",
      category,
    });
  });

  router.post(
    "/",
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    async (req, res) => {
      const category = { ...req.body, thumbnail: req.files };
      const createdCategory = await categoryController.createCategory(category);
      res.status(201).send({
        success: "Category created successfully",
        category: createdCategory,
      });
    }
  );

  router.patch(
    "/:id",
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    async (req, res) => {
      const { id } = req.params;
      const categoryData = { ...req.body };

      if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        const thumbnailFile = req.files.thumbnail[0];
        categoryData.thumbnail = thumbnailFile;
      }

      const category = await categoryController.updateCategory(
        id,
        categoryData
      );
      res.status(200).send({
        success: "Category updated successfully",
        category,
      });
    }
  );

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const category = await categoryController.deleteCategory(id);
    res.status(200).send({
      success: "Category deleted successfully",
      category,
    });
  });

  return router;
};

module.exports = categoryRouter;
