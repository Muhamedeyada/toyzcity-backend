const express = require("express");
const router = express.Router();

const contactUsRouter = (contactUsController) => {
  router.post("/", async (req, res) => {
    const email = await contactUsController.sendEmail(req.body);
    res.status(200).send({
      success: "Email sent successfully",
      email,
    });
  });

  router.get("/", async (req, res) => {
    const emails = await contactUsController.getAllEmails();
    res.status(200).send({
      success: "All emails fetched successfully",
      emails,
    });
  });

  router.delete("/", async (req, res) => {
    const deletedEmails = await contactUsController.deleteAllEmails();
    res
      .status(200)
      .send({ success: "Email deleted successfully", deletedEmails });
  });

  return router;
};

module.exports = contactUsRouter;
