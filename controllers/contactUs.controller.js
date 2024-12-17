const nodemailer = require("nodemailer");
require("dotenv").config();
const {
  contactUsSchema,
} = require("../utils/validation/contactUs.validation.js");
const CustomError = require("../utils/CustomError.js");

class ContactUsController {
  contactUsRepository;
  transporter;
  constructor(contactUsRepository) {
    this.contactUsRepository = contactUsRepository;
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
  }

  async sendEmail(MessageData) {
    const { error } = contactUsSchema.validate(MessageData);
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(", ").replace(/"/g, ""), 400);
    }
    const email = await this.contactUsRepository.createEmail(MessageData);
    const mailOptions = {
      from: '"Toy Treasures" <' + process.env.SENDER_EMAIL + ">",
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Mail from ${MessageData.fullName}`,
      text: `
        New contact Email from ${MessageData.fullName}:
        Name: ${MessageData.fullName}
        Email: ${MessageData.email}
        Message: ${MessageData.messageText}
      `,
    };
    await this.transporter.verify();
    const info = await this.transporter.sendMail(mailOptions);
    return email;
  }

  async getAllEmails() {
    return await this.contactUsRepository.getAllEmails();
  }

  async deleteAllEmails() {
    return await this.contactUsRepository.deleteAllEmails();
  }
}

module.exports = ContactUsController;
