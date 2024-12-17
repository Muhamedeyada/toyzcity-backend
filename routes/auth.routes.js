const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();

const authRouter = (authController) => {
  router.post("/register", async (req, res) => {
    const { role, ...userData } = req.body;
    const user = await authController.register(userData);
    res.status(200).send({ success: "User registered successfully", user });
  });

  router.post("/login", async (req, res) => {
    const { accessToken, refreshToken, user } = await authController.login(
      req.body
    );
    const options = {
      httpOnly: true,
    };
    res.status(200).cookie("refreshToken", refreshToken, options).send({
      success: "User logged in successfully",
      accessToken,
      user,
    });
  });

  router.post("/logout", auth, async (req, res) => {
    const { _id: userId } = req.user;
    const user = await authController.logout(userId);
    const options = {
      httpOnly: true,
    };
    res
      .status(200)
      .clearCookie("refreshToken", options)
      .send({ success: "User logged out successfully", user });
  });

  router.post("/refresh-token", async (req, res) => {
    const { refreshToken: incommingRefreshToken } = req.cookies;
    const { accessToken, refreshToken, user } =
      await authController.refreshAccessToken(incommingRefreshToken);
    const options = {
      httpOnly: true,
    };
    res.status(200).cookie("refreshToken", refreshToken, options).send({
      success: "Access token refreshed successfully",
      accessToken,
      user,
    });
  });

  return router;
};

module.exports = authRouter;
