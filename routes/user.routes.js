const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();

const userRouter = (userController) => {
  router.get("/", async (req, res) => {
    const users = await userController.getAllUsers();
    res.status(200).send({ success: "All users fetched successfully", users });
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await userController.getUserById(id);
    res.status(200).send({ success: "User fetched successfully", user });
  });

  router.patch("/:id", auth, async (req, res) => {
    const { id } = req.params;
    const user = await userController.updateUser(id, req.body);
    res.status(200).send({ success: "User updated successfully", user });
  });

  return router;
};

module.exports = userRouter;
